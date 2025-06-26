import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'stretto_notes_gpt';
const COLLECTION_NAME = 'practice_logs';

let cachedClient = null;

async function getMongoClient() {
  if (cachedClient) return cachedClient;
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI env variable');
  console.log('Connecting to MongoDB');
  const client = new MongoClient(MONGODB_URI);
  console.log('MongoDB client object', client);

   await client.connect();
  console.log('Client connection attempt finished');
  cachedClient = client;
  return client;
}

export const handler = async (event) => {
  console.log('Lambda function invoked')
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('MONGODB_URI:', MONGODB_URI ? '[set]' : '[NOT SET]');

  try {
    if (!event.body) {
      throw new Error('Missing event.body');
    }
    const body = JSON.parse(event.body);
    console.log('Parsed body:', JSON.stringify(body, null, 2));

    const client = await getMongoClient();
    console.log('Mongo client acquired');
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    console.log('DB and collection ready');

    const result = await collection.insertOne(body);
    console.log('Insert result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Practice note saved', insertedId: result.insertedId }),
    };
  } catch (err) {
    console.error('Error inserting note:', err.stack || err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to insert practice log', details: err.message }),
    };
  }
};

