import { MISSING_SCHEMA_VALUES, MONGO_CREATE_ERROR } from '../../shared/constants.js';
import { getMongoClient } from '../../shared/mongo-client.js';
import { DB_NAME, NOTE_COLLECTION_NAME } from '../../shared/constants.js';


export async function handler(event) {

  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;


  const client = getMongoClient();
  const db = client.db(DB_NAME)
  const collection = db.collection(NOTE_COLLECTION_NAME)


  if (!body.rep_id
    || !body.note_id
    || !body.time
    || !body.date
    || !body.duration_minutes
    || !body.entries ||
    // Must have at least one entry.
    !(Array.isArray(body.entries) & body.entries.length > 0)
) {
    return { statusCode: 400, body: JSON.stringify({ error: MISSING_SCHEMA_VALUES }) }
  }

  try {
    await collection.insertOne(body);

  } catch(err) {
    return { statusCode: 500, body: JSON.stringify({ error: MONGO_CREATE_ERROR }) }

  }

}
