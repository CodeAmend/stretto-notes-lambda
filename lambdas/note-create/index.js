// index.js
import { getMongoClient } from '../../shared/mongo-client.js';
import { returnResponse } from '../../shared/helpers.js';
import { validateNote } from './validators/noteValidator.js';
import { 
  DB_NAME, 
  NOTE_COLLECTION_NAME, 
  MONGO_CLIENT_ERROR, 
  MONGO_CREATE_ERROR 
} from '../../shared/constants.js';

export async function handler(event) {
  // Parse body
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  // Validate with Joi
  const validation = validateNote(body);
  if (!validation.valid) {
    return returnResponse(400, {
      ok: false,
      error: 'Validation failed',
      details: validation.errors
    });
  }

  // Get MongoDB client
  let client;
  try {
    client = await getMongoClient();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return returnResponse(500, { ok: false, error: MONGO_CLIENT_ERROR });
  }

  const db = client.db(DB_NAME);
  const collection = db.collection(NOTE_COLLECTION_NAME);

  // Prepare note data with timestamps
  const noteData = {
    ...validation.value,
    created_at: new Date(),
    updated_at: new Date()
  };

  try {
    // Insert note
    const result = await collection.insertOne(noteData);
    
    // Return success
    return {
      statusCode: 201,
      body: JSON.stringify({ 
        ok: true,
        id: result.insertedId
      })
    };
    
  } catch (err) {
    console.error('MongoDB insert error:', err);
    return returnResponse(500, { ok: false, error: MONGO_CREATE_ERROR });
  }
}
