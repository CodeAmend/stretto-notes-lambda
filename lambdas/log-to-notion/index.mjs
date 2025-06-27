import 'dotenv/config';
import { getMongoClient } from './mongo-client.js';
import { Client } from '@notionhq/client';
import {
  dateToggleBlock,
  noteSectionBlock,
  tagBlock,
  focusBlock,
  notesContentBlock,
  questionsLabelBlock,
  questionsBullets,
  spacerBlock,
} from './blocks.js';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const REPERTOIRE_DB_ID = process.env.REPERTOIRE_DB_ID;
const DB_NAME = 'stretto_notes_gpt';
const COLLECTION_NAME = 'practice_logs';

const notion = new Client({ auth: NOTION_API_KEY });

export async function handler(event) {
  // 1. Parse event for date and piece_id
  let { date, piece_id } = typeof event.body === 'string'
    ? JSON.parse(event.body)
    : event.body;

  if (!date || !piece_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: date, piece_id' }),
    };
  }

  // 2. Aggregate all notes for this date + piece
  let notes = [];
  let client;
  try {
    client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const agg = await collection.aggregate([
      { $match: { piece_id, date } },
      { $group: { _id: "$noteId", note: { $first: "$$ROOT" } } }
    ]).toArray();
    notes = agg.map(g => g.note);
  } catch (err) {
    console.error('Mongo aggregation error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'MongoDB aggregation failed', detail: err.message }),
    };
  }

  // 3. Build Notion blocks for all notes (in handler!)
  const noteSections = notes.map(note => {
    const entryBlocks = (note.entries || []).flatMap(entry => [
      tagBlock(entry.tags),
      focusBlock(entry),
      notesContentBlock(entry.content),
      questionsLabelBlock(),
      ...questionsBullets(entry.teacher_questions),
      spacerBlock()
    ].filter(Boolean));
    return noteSectionBlock(
      `📝 Note${note.time ? ` — ${note.time}` : ""}`,
      entryBlocks
    );
  });
  const dateBlock = dateToggleBlock(date, noteSections);

  // 4. Find rep page in Notion by piece_id
  let page;
  try {
    const dbRes = await notion.databases.query({
      database_id: REPERTOIRE_DB_ID,
      filter: { property: "piece_id", rich_text: { equals: piece_id } }
    });
    page = dbRes.results[0];
    if (!page) throw new Error("No Notion rep page found");
  } catch (err) {
    console.error('Notion page query error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to find rep page in Notion', detail: err.message }),
    };
  }

  // 5. Find Practice Log heading and all top-level blocks
  let topBlocks = [];
  try {
    const children = await notion.blocks.children.list({ block_id: page.id, page_size: 100 });
    topBlocks = children.results;
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch page children', detail: err.message }),
    };
  }

  // Find Practice Log heading
  const logHeading = topBlocks.find(
    b => b.type.startsWith('heading') && b[b.type].rich_text[0]?.plain_text?.includes('Practice Log')
  );
  if (!logHeading) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No Practice Log heading found in Notion page.' }),
    };
  }

  // Find and delete existing toggle for this date (if any)
  const dateToggle = topBlocks.find(
    b => b.type === 'toggle' &&
         b.toggle.rich_text[0]?.plain_text?.trim() === date
  );
  if (dateToggle) {
    try {
      await notion.blocks.delete({ block_id: dateToggle.id });
    } catch (err) {
      console.warn(`Failed to delete old toggle for date ${date}:`, err.message);
    }
  }

  // 6. Append new date toggle block under Practice Log
  try {
    await notion.blocks.children.append({
      block_id: logHeading.id,
      children: [dateBlock]
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Date toggle updated/created in Notion.' }),
    };
  } catch (err) {
    console.error('Failed to append new date toggle:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to append date toggle', detail: err.message }),
    };
  }
}

