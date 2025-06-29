// lambdas/repertoire-create/index.js
import { getMongoClient } from '../../shared/mongo-client.js';
import { returnResponse } from '../../shared/helpers.js';
import { validateRepertoire } from './validators/repertoireValidator.js';
import { 
  DB_NAME, 
  REP_COLLECTION_NAME, 
  MONGO_CLIENT_ERROR, 
  MONGO_CREATE_ERROR 
} from '../../shared/constants.js';

export async function handler(event) {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  // Validate with Joi
  const validation = validateRepertoire(body);
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
  const collection = db.collection(REP_COLLECTION_NAME);

  // Check if rep_id already exists
  const existing = await collection.findOne({ rep_id: validation.value.rep_id });

  if (existing) {
    return returnResponse(409, {
      ok: false,
      error: `Repertoire with rep_id '${validation.value.rep_id}' already exists`
    });
  }

  // Prepare repertoire data with timestamps
  const repertoireData = {
    ...validation.value,
    created_at: new Date(),
    updated_at: new Date()
  };

  try {
    // Insert repertoire
    const result = await collection.insertOne(repertoireData);
    
    // Return success
    return {
      statusCode: 201,
      body: JSON.stringify({ 
        ok: true,
        id: result.insertedId,
        rep_id: repertoireData.rep_id
      })
    };
    
  } catch (err) {
    console.error('MongoDB insert error:', err);
    return returnResponse(500, { ok: false, error: MONGO_CREATE_ERROR });
  }
}
