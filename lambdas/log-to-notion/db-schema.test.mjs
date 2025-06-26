// db-schema.test.mjs
import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const REPERTOIRE_DB_ID = process.env.REPERTOIRE_DB_ID;

async function run() {
  try {
    const db = await notion.databases.retrieve({ database_id: REPERTOIRE_DB_ID });
    console.log('--- Database Properties ---');
    for (const [key, value] of Object.entries(db.properties)) {
      console.log(`${key}:`, JSON.stringify(value, null, 2));
    }
    // If you want just property names:
    console.log('\nColumn names:', Object.keys(db.properties));
  } catch (err) {
    console.error('ERROR:', err);
  }
}

run();

