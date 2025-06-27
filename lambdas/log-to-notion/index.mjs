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
  const noteSectionBlocks = notes.map(note => {
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

  // 4. Fetch all top-level blocks in the page
  let pageBlocks = [];
  try {
    const children = await notion.blocks.children.list({ block_id: page.id, page_size: 100 });
    pageBlocks = children.results;
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch page children', detail: err.message }),
    };
  }

  // 5. Find Practice Log heading
  const logHeadingIndex = pageBlocks.findIndex(
    b => b.type.startsWith('heading') && b[b.type].rich_text[0]?.plain_text?.includes('Practice Log')
  );
  if (logHeadingIndex === -1) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No Practice Log heading found in Notion page.' }),
    };
  }

  // 6. Find existing date toggle (sibling, not child)
  const dateToggleBlockObj = pageBlocks.find(
    b => b.type === 'toggle' && b.toggle.rich_text[0]?.plain_text?.trim() === date
  );
  let dateToggleId = dateToggleBlockObj?.id;

  if (dateToggleId) {
    // a. Delete all children of the existing date toggle
    try {
      const oldChildren = await notion.blocks.children.list({ block_id: dateToggleId, page_size: 100 });
      for (const child of oldChildren.results) {
        await notion.blocks.delete({ block_id: child.id });
      }
      // b. Append new note sections to the existing toggle
      if (noteSectionBlocks.length > 0) {
        await notion.blocks.children.append({
          block_id: dateToggleId,
          children: noteSectionBlocks
        });
      }
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to update existing date toggle', detail: err.message }),
      };
    }
  } else {
    // Create a new toggle for this date and append
    try {
      const appendRes = await notion.blocks.children.append({
        block_id: page.id,
        children: [dateToggleBlock(date, noteSectionBlocks)]
      });
      dateToggleId = appendRes.results[0]?.id;
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to append new date toggle', detail: err.message }),
      };
    }
  }

  // 7. Reorder so the date toggle is immediately after Practice Log heading
  try {
    const updatedChildren = await notion.blocks.children.list({ block_id: page.id, page_size: 100 });
    const blockIds = updatedChildren.results.map(b => b.id);

    // Find the current index of Practice Log heading and the date toggle
    const headingIdx = blockIds.indexOf(pageBlocks[logHeadingIndex].id);
    const dateToggleIdx = blockIds.indexOf(dateToggleId);

    if (headingIdx !== -1 && dateToggleIdx !== -1) {
      // Remove date toggle from its current position
      const reordered = blockIds.filter(id => id !== dateToggleId);
      // Insert date toggle right after the Practice Log heading
      reordered.splice(headingIdx + 1, 0, dateToggleId);

      await notion.blocks.children.update({
        block_id: page.id,
        children: reordered.map(id => ({ id }))
      });
    }
  } catch (err) {
    // Not fatal
    console.warn('[Notion] Failed to reorder blocks:', err.message);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Date toggle updated/created in Notion.' }),
  };
}

