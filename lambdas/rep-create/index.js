import { getMongoClient } from '../../shared/mongo-client.js';
import { returnResponse, returnSuccessResponse, validateGenericBody } from '../../shared/helpers.js';
import { DB_NAME, MONGO_CLIENT_ERROR, MONGO_CREATE_ERROR, REP_COLLECTION_NAME } from '../../shared/constants.js';

export async function handler(event) {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  // Define the required fields for the current resource (could be any data structure)
  const requiredFields = ['rep_id', 'title', 'type'];
  const validationError = validateGenericBody(body, requiredFields);
  if (validationError) {
    return returnResponse(400, validationError);
  }

  let client;
  try {
    client = await getMongoClient();
  } catch {
    return returnResponse(500, MONGO_CLIENT_ERROR);
  }

  const db = client.db(DB_NAME);
  const collection = db.collection(REP_COLLECTION_NAME);

  try {
    await collection.insertOne(body);
  } catch (err) {
    return returnResponse(500, MONGO_CREATE_ERROR);
  }

  return returnSuccessResponse(201);
}

