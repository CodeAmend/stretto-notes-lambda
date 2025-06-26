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

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const REPERTOIRE_DB_ID = process.env.REPERTOIRE_DB_ID;

export async function handler(event) {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const note = body;

  const dbRes = await notion.databases.query({
    database_id: REPERTOIRE_DB_ID,
    filter: {
      property: "piece_id",
      rich_text: { equals: note.piece_id }
    }
  });

  const page = dbRes.results[0];
  if (!page) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'No page found for that piece_id.' })
    };
  }

  const sessionTitle = `${note.date} — Practice Session (${note.duration_minutes} min)`;

  // For each entry, explicitly assemble the blocks (not via a wrapper function)
  let allBlocks = [titleBlock(sessionTitle)];
  for (const entry of note.entries) {
    // Only add blocks that are not null/undefined
    [
      tagBlock(entry.tags),
      focusBlock(entry),
      notesContentBlock(entry.content),
      questionsLabelBlock(),
      ...questionsBullets(entry.teacher_questions),
      spacerBlock()
    ].forEach(block => { if (block) allBlocks.push(block); });
  }

  await notion.blocks.children.append({
    block_id: page.id,
    children: allBlocks
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Notes appended to Notion.', pageId: page.id })
  };
}

