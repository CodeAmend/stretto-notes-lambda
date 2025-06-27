import 'dotenv/config';
import { Client } from '@notionhq/client';
import {
  titleBlock,
  tagBlock,
  focusBlock,
  notesContentBlock,
  questionsLabelBlock,
  questionsBullets,
  spacerBlock
} from './blocks.js';
import { buildRepProperties } from './notion-utils.js';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const REPERTOIRE_DB_ID = process.env.REPERTOIRE_DB_ID;

export async function handler(event) {
  console.log("🔹 Lambda triggered. Event:", JSON.stringify(event));

  let note;
  try {
    note = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    console.log("🔹 Parsed note:", JSON.stringify(note));
  } catch (err) {
    console.error("❌ Failed to parse request body:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body', detail: err.message }),
    };
  }

  if (!note.piece_id || !note.entries || !Array.isArray(note.entries)) {
    console.error("❌ Missing required fields: piece_id or entries");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: piece_id or entries' }),
    };
  }

  let page;
  try {
    console.log(`🔹 Querying Notion for piece_id: ${note.piece_id}`);
    let dbRes = await notion.databases.query({
      database_id: REPERTOIRE_DB_ID,
      filter: { property: "piece_id", rich_text: { equals: note.piece_id } }
    });
    page = dbRes.results[0];
    console.log(`🔹 Notion query complete. Found page: ${!!page}`);

    if (!page) {
      const properties = buildRepProperties(note);
      console.log("🔹 Creating new Notion rep item with properties:", JSON.stringify(properties));
      const created = await notion.pages.create({
        parent: { database_id: REPERTOIRE_DB_ID },
        properties
      });
      page = created;
      console.log("✅ Created new Notion rep item:", page.id);
    } else {
      console.log("✅ Found existing Notion rep item:", page.id);
    }
  } catch (err) {
    console.error("❌ Error finding or creating rep in Notion:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error finding or creating rep in Notion", detail: err.message }),
    };
  }

  const sessionTitle = `${note.date} — Practice Session (${note.duration_minutes} min)`;
  let allBlocks = [titleBlock(sessionTitle)];
  try {
    for (const entry of note.entries) {
      [
        tagBlock(entry.tags),
        focusBlock(entry),
        notesContentBlock(entry.content),
        questionsLabelBlock(),
        ...questionsBullets(entry.teacher_questions),
        spacerBlock()
      ].forEach(block => { if (block) allBlocks.push(block); });
    }
    console.log(`🔹 Built ${allBlocks.length} blocks to append.`);
  } catch (err) {
    console.error("❌ Error building blocks for Notion append:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error building blocks for Notion", detail: err.message }),
    };
  }

  try {
    console.log(`🔹 Appending blocks to Notion page ${page.id}`);
    await notion.blocks.children.append({
      block_id: page.id,
      children: allBlocks
    });
    console.log("✅ Successfully appended blocks to Notion page.");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notes appended to Notion.', pageId: page.id })
    };
  } catch (err) {
    console.error("❌ Error appending blocks to Notion:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error appending blocks to Notion", detail: err.message }),
    };
  }
}

