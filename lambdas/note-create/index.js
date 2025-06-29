import { getMongoClient } from '../../shared/mongo-client.js';
import { returnResponse, validateNoteBody } from '../../shared/helpers.js';
import { DB_NAME, NOTE_COLLECTION_NAME, MONGO_CLIENT_ERROR, MONGO_CREATE_ERROR } from '../../shared/constants.js';


export async function handler(event) {

  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  const validationError = validateNoteBody(body);
  if (validationError) {
    return returnResponse(400, validationError)
  }

  let client;
  try {
    client = await getMongoClient();
  } catch {
    return returnResponse(500, MONGO_CLIENT_ERROR)
  }
  const db = client.db(DB_NAME)
  const collection = db.collection(NOTE_COLLECTION_NAME)



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
