import 'dotenv/config';
import { getMongoClient } from './mongo-client.js';
import { formatTimeTo12hr } from './util.js';
import { Client } from '@notionhq/client';
import {
  dateToggleBlock,
  tagBlock,
  focusBlock,
  notesContentBlock,
  questionsLabelBlock,
  questionsBullets,
  spacerBlock
} from './blocks.js';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const REPERTOIRE_DB_ID = process.env.REPERTOIRE_DB_ID;
const DB_NAME = 'stretto_notes_gpt';
const COLLECTION_NAME = 'practice_logs';

export async function handler(event) {
  let { date, piece_id } = typeof event.body === 'string'
    ? JSON.parse(event.body)
    : event.body;

  if (!date || !piece_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: date, piece_id' }),
    };
  }

  // 1. Aggregate all notes for this date + piece
  let notes = [];
  try {
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const agg = await collection.aggregate([
      { $match: { piece_id, date } },
      { $group: { _id: "$noteId", note: { $first: "$$ROOT" } } }
    ]).toArray();
    notes = agg.map(g => g.note);
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'MongoDB aggregation failed', detail: err.message }),
    };
  }

  // 2. Build new note section blocks
  const noteSectionBlocks = notes.flatMap(note => {
    // Paragraph or callout block for the session time header
    const sessionHeader = {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { type: 'text', text: { content: `📝 Session${note.time ? ` — ${formatTimeTo12hr(note.time)}` : ""}` } }
        ]
      }
    };

    const entryBlocks = (note.entries || []).flatMap(entry => [
      tagBlock(entry.tags),
      focusBlock(entry),
      notesContentBlock(entry.content),
      questionsLabelBlock(),
      ...questionsBullets(entry.teacher_questions),
      spacerBlock()
    ].filter(Boolean));

    // Return session header, then all entry blocks (flattened)
    return [sessionHeader, ...entryBlocks];
  });

  // 3. Find rep page in Notion by piece_id
  let page;
  try {
    const dbRes = await notion.databases.query({
      database_id: REPERTOIRE_DB_ID,
      filter: { property: "piece_id", rich_text: { equals: piece_id } }
    });
    page = dbRes.results[0];
    if (!page) throw new Error("No Notion rep page found");
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to find rep page in Notion', detail: err.message }),
    };
  }

  // 4. Find existing date toggle (sibling at page level)
  let dateToggleId;
  try {
    const pageBlocks = (await notion.blocks.children.list({ block_id: page.id, page_size: 100 })).results;
    const dateToggleBlockObj = pageBlocks.find(
      b => b.type === 'toggle' && b.toggle.rich_text[0]?.plain_text?.trim() === date
    );
    dateToggleId = dateToggleBlockObj?.id;

    if (dateToggleId) {
      // Delete the entire date toggle and all its children in one API call
      try {
        await notion.blocks.delete({ block_id: dateToggleId });
      } catch (err) {
        console.warn(`[Notion] Failed to delete old toggle for date ${date}:`, err.message);
        // Not fatal, continue to create a new one
      }
    }
  } catch (err) {
    // Not fatal
    console.warn('[Notion] Failed to check for existing date toggle:', err.message);
  }

  // 5. Always append a new toggle for this date and notes (at page bottom)
  try {
    await notion.blocks.children.append({
      block_id: page.id,
      children: [dateToggleBlock(date, noteSectionBlocks)]
    });
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to append new date toggle', detail: err.message }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Date toggle updated/created at bottom of Notion page.' }),
  };
}

