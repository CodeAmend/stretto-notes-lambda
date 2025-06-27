import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
let cachedClient = null;

export async function getMongoClient() {
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

