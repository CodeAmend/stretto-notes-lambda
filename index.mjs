// index.mjs
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'stretto_notes_gpt';
const COLLECTION_NAME = 'practice_logs';

let cachedClient = null;

async function getMongoClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export const handler = async (event) => {
  try {
    // Parse body (from GPT/API Gateway POST)
    const body = JSON.parse(event.body);

    // Lazy init Mongo client
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Insert into DB
    const result = await collection.insertOne(body);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Practice note saved', insertedId: result.insertedId }),
    };
  } catch (err) {
    console.error('Error inserting note:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to insert practice log' }),
    };
  }
};

