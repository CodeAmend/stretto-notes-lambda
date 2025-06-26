// append-bullets-by-piece-id.mjs
import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const REPERTOIRE_DB_ID = process.env.REPERTOIRE_DB_ID;
const TARGET_PIECE_ID = 'test_piece_id_for_upsert'; // Matches our test row

const notesToAppend = [
  'GPT note: Practiced the hard passage at quarter speed.',
  'GPT note: Focused on articulation in the left hand.',
  'GPT note: Still needs work on transitions.'
];

async function run() {
  // 1. Find the row in your DB with the target piece_id
  const dbRes = await notion.databases.query({
    database_id: REPERTOIRE_DB_ID,
    filter: {
      property: "piece_id",
      rich_text: { equals: TARGET_PIECE_ID }
    }
  });

  const page = dbRes.results[0];
  if (!page) {
    console.log('❌ No page found with that piece_id.');
    return;
  }

  // 2. Append notes as bullets to the body of the page
  const children = notesToAppend.map(text => ({
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content: text } }]
    }
  }));

  await notion.blocks.children.append({
    block_id: page.id,
    children
  });

  console.log('✅ Notes added to page:', page.id, '| Title:', page.properties.Name.title[0]?.plain_text);
}

run();

