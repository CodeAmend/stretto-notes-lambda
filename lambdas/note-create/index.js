import { getMongoClient } from '../../shared/mongo-client.js';
import { returnResponse } from '../../shared/helpers.js';
import { DB_NAME, NOTE_COLLECTION_NAME, MONGO_CLIENT_ERROR, MONGO_CREATE_ERROR, MISSING_SCHEMA_VALUES } from '../../shared/constants.js';


export async function handler(event) {

  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;


  let client;
  try {
    client = await getMongoClient();
  } catch {
    return returnResponse(500, MONGO_CLIENT_ERROR)
  }
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
    return returnResponse(400, MISSING_SCHEMA_VALUES)
  }

  try {
    await collection.insertOne(body);

  } catch(err) {
    return returnResponse(500, MONGO_CREATE_ERROR)

  }

  return {
    statusCode: 201,
    body: JSON.stringify({ ok: true })
  };

}
