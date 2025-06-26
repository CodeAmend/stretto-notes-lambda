// add-test-item.mjs
import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const REPERTOIRE_DB_ID = process.env.REPERTOIRE_DB_ID;

async function run() {
  try {
    const response = await notion.pages.create({
      parent: { database_id: REPERTOIRE_DB_ID },
      properties: {
        // Required "Name" column (for easy spot in Notion)
        Name: {
          title: [
            { text: { content: 'TEST - Example Add' } }
          ]
        },
        // Select fields (must match exactly)
        Composer: { select: { name: 'Chopin' } },
        Style: { select: { name: 'Waltz' } },
        Status: { select: { name: 'Learning' } },
        'Teacher (Vivid)': { status: { name: 'Very Good' } },
        Memorization: { status: { name: 'Recognizing Patterns' } },
        Control: { status: { name: 'Early Practice' } },
        Expression: { status: { name: 'Exploring Ideas' } },
        // Multi-select fields
        Keys: { multi_select: [ { name: 'C# minor' }, { name: 'E Major' } ] },
        'Time Signature': { multi_select: [ { name: '3/4' } ] },
        // For upsert testing later: unique piece_id
        piece_id: {
          rich_text: [
            { text: { content: 'test_piece_id_for_upsert' } }
          ]
        },
        // Optional: Score URL
        Score: { url: 'https://imslp.org/wiki/Waltz_in_C-sharp_minor,_Op.64_No.2_(Chopin,_Fr%C3%A9d%C3%A9ric)' }
      }
    });

    console.log('✅ Success! Page created:', response.id);
  } catch (err) {
    console.error('❌ ERROR:', err);
  }
}

run();

