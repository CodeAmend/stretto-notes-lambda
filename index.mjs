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
    console.error('[Mongo] MONGODB_URI is not set');
    throw new Error('Missing MONGODB_URI env variable');
  }

  console.log('[Mongo] Creating new MongoClient');
  const client = new MongoClient(MONGODB_URI);

  console.log('[Mongo] Attempting to connect...');
  await client.connect();
  console.log('[Mongo] Connected successfully');

  cachedClient = client;
  return client;
}

export async function handler(event) {
  console.log('Received event:', event);

  let notes;
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    notes = Array.isArray(body) ? body : [body];
  } catch (err) {
    console.error('Failed to parse request body:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  if (!notes.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No notes provided' }),
    };
  }

  const missingNoteIds = notes.filter(note => !note.noteId);
  if (missingNoteIds.length > 0) {
    console.warn(`Rejected request due to ${missingNoteIds.length} note(s) missing noteId`);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'All notes must include a noteId',
        missingNoteIdCount: missingNoteIds.length,
      }),
    };
  }

  try {
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const results = [];

    for (const note of notes) {
      const result = await collection.updateOne(
        { noteId: note.noteId },
        { $set: note },
        { upsert: true }
      );

      results.push({
        noteId: note.noteId,
        matched: result.matchedCount,
        upserted: result.upsertedCount,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notes processed', results }),
    };
  } catch (err) {
    console.error('Error during MongoDB operation:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        detail: err.message || 'Unknown error',
        stack: err.stack || null
      }),
    };
  }
}

