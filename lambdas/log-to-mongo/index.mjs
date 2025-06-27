import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'stretto_notes_gpt';
const COLLECTION_NAME = 'practice_logs';

let cachedClient = null;

async function getMongoClient() {
  if (cachedClient) {
    console.log('[Mongo] Reusing cached client');
    return cachedClient;
  }

  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI env variable');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  console.log('[Mongo] Connected successfully');
  cachedClient = client;
  return client;
}

export async function handler(event) {
  console.log('[Lambda] Received event');

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

    console.log(`[Mongo] Writing noteId: ${note.noteId} to collection: ${COLLECTION_NAME}`);
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Note processed in Mongo',
        mongo: results,
        note,
      }),
    };
  } catch (err) {
    console.error('[Mongo] Operation failed:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'MongoDB operation failed',
        detail: err.message || 'Unknown error',
        stack: err.stack || null
      }),
    };
  }
}

