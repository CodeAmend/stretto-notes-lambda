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

// ---- Helper: Create Default Properties for New Rep Item ----
function buildRepProperties(note) {
  // Minimum: Name (title), piece_id
  const properties = {
    Name: {
      title: [
        { text: { content: note.title || note.piece_id || "Untitled" } }
      ]
    },
    piece_id: {
      rich_text: [
        { text: { content: note.piece_id } }
      ]
    }
  };

  // Optionals: Use these only if present in the note and you want them mapped
  if (note.composer) {
    properties.Composer = { select: { name: note.composer } }; // If your Composer is a select property
  }
  if (note.style) {
    properties.Style = { select: { name: note.style } };
  }
  if (note.keys && note.keys.length) {
    properties.Keys = { multi_select: note.keys.map(name => ({ name })) };
  }
  if (note['Time Signature']) {
    properties["Time Signature"] = { multi_select: note['Time Signature'].map(name => ({ name })) };
  }
  if (note.status) {
    properties.Status = { select: { name: note.status } };
  }

  // Set defaults for all status properties (minimally required, adjust if your DB requires these!)
  // These can be made smarter as needed.
  properties['Teacher (Vivid)'] = { status: { name: "Needs Work" } };
  properties['Memorization'] = { status: { name: "Unfamiliar" } };
  properties['Control'] = { status: { name: "Not Yet Studied" } };
  properties['Expression'] = { status: { name: "Not Yet Shaped" } };

  return properties;
}

// ---- Lambda handler ----
export async function handler(event) {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const note = body;

  // 1. Check for existing rep item by piece_id
  let dbRes = await notion.databases.query({
    database_id: REPERTOIRE_DB_ID,
    filter: {
      property: "piece_id",
      rich_text: { equals: note.piece_id }
    }
  });

  let page = dbRes.results[0];

  // 2. If not found, create new rep item
  if (!page) {
    const properties = buildRepProperties(note);

    const created = await notion.pages.create({
      parent: { database_id: REPERTOIRE_DB_ID },
      properties
    });
    page = created;
  }

  // 3. Build blocks for appending notes
  const sessionTitle = `${note.date} — Practice Session (${note.duration_minutes} min)`;

  let allBlocks = [titleBlock(sessionTitle)];
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

  // 4. Append notes to the page
  await notion.blocks.children.append({
    block_id: page.id,
    children: allBlocks
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Notes appended to Notion.', pageId: page.id })
  };
}

