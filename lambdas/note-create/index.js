import { getMongoClient } from '../../shared/mongo-client.js';
import { returnResponse, validateGenericBody } from '../../shared/helpers.js';
import { DB_NAME, NOTE_COLLECTION_NAME, MONGO_CLIENT_ERROR, MONGO_CREATE_ERROR, ERROR_MISSING_ENTRIES } from '../../shared/constants.js';


export async function handler(event) {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  const requiredFields = ['rep_id', 'title', 'note_type', 'entries'];
  const validationError = validateGenericBody(body, requiredFields);
  if (validationError) {
    return returnResponse(400, validationError);
  }

  // Ensure entries is an array and not empty
  if (!Array.isArray(body.entries) || body.entries.length === 0) {
    return returnResponse(400, ERROR_MISSING_ENTRIES);
  }

  let client;
  try {
    client = await getMongoClient();  // Attempt to connect to Mongo
  } catch (err) {
    // If the MongoDB client fails, return 500
    return returnResponse(500, MONGO_CLIENT_ERROR);
  }

  const db = client.db(DB_NAME);
  const collection = db.collection(NOTE_COLLECTION_NAME);

  try {
    await collection.insertOne(body);  // Insert the resource into MongoDB
  } catch (err) {
    return returnResponse(500, MONGO_CREATE_ERROR);  // Handle MongoDB creation error
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ ok: true })  // Return success on successful insertion
  };
}

