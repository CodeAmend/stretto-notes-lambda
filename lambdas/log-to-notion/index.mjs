import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const REPERTOIRE_DB_ID = process.env.REPERTOIRE_DB_ID;

export async function handler(event) {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const repertoire = body;

    if (!repertoire || !repertoire.piece_id || !repertoire.piece) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: piece and piece_id' })
      };
    }

    // Check for existing repertoire entry
    const existing = await notion.databases.query({
      database_id: REPERTOIRE_DB_ID,
      filter: {
        property: 'piece_id',
        rich_text: {
          equals: repertoire.piece_id
        }
      }
    });

    if (existing.results.length > 0) {
      console.log(`Repertoire already exists: ${repertoire.piece_id}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Repertoire already exists', piece_id: repertoire.piece_id })
      };
    }

    // Create new repertoire entry
    const properties = {
      Name: {
        title: [{ text: { content: repertoire.piece } }]
      },
      Composer: {
        rich_text: [{ text: { content: repertoire.composer || "" } }]
      },
      piece_id: {
        rich_text: [{ text: { content: repertoire.piece_id } }]
      }
    };

    if (repertoire.style) {
      properties.Style = { select: { name: repertoire.style } };
    }

    const page = await notion.pages.create({
      parent: { database_id: REPERTOIRE_DB_ID },
      properties
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Repertoire created', pageId: page.id })
    };
  } catch (err) {
    console.error('Failed to upsert repertoire:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || 'Unknown error',
        stack: err.stack || null
      })
    };
  }
}

