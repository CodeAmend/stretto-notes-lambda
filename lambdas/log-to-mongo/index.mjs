import { MongoClient } from 'mongodb';

const NOTION_URI = process.env.STRETTO_NOTION_URI;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'stretto_notes_gpt';
const COLLECTION_NAME = 'practice_logs';

let cachedClient = null;

async function getMongoClient() {
  if (cachedClient) return cachedClient;
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI env variable');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function handler(event) {
  let note;
  try {
    note = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  if (!note.noteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'All notes must include a noteId' }),
    };
  }

  // ---- MONGO WRITE ----
  let results;
  try {
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const noteResponse = await collection.updateOne(
      { noteId: note.noteId },
      { $set: note },
      { upsert: true }
    );

    results = {
      noteId: note.noteId,
      matched: noteResponse.matchedCount,
      upserted: noteResponse.upsertedCount,
    };
  } catch (err) {
    // Mongo failure: fail and return immediately!
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'MongoDB operation failed',
        detail: err.message || 'Unknown error',
        stack: err.stack || null
      }),
    };
  }

  // ---- NOTION WEBHOOK ----
  if (NOTION_URI) {
    try {
      const fetchRes = await fetch(NOTION_URI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });

      const fetchText = await fetchRes.text();
      if (!fetchRes.ok) {
        return {
          statusCode: 202,
          body: JSON.stringify({
            message: 'Note processed in Mongo, but Notion webhook failed',
            mongo: results,
            notionStatus: fetchRes.status,
            notionResponse: fetchText
          }),
        };
      }


      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Note processed and sent to Notion',
          mongo: results,
          notionStatus: fetchRes.status
        }),
      };

    } catch (webhookErr) {
      return {
        statusCode: 202,
        body: JSON.stringify({
          message: 'Note processed in Mongo, but Notion webhook errored',
          mongo: results,
          webhookError: webhookErr.message || webhookErr
        }),
      };
    }
  } else {
    // No NOTION_URI configured: success, but Notion not called
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Note processed in Mongo, but Notion webhook not configured (no STRETTO_NOTION_URI or API key)',
        mongo: results
      }),
    };
  }
}

