import 'dotenv/config';
import { getMongoClient } from '../mongo-client.js'

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'stretto_notes_gpt';
const COLLECTION_NAME = 'practice_logs';

export async function handler() {
  console.log("YO")

  let result;
  let client;
  try {
    client = await getMongoClient(MONGODB_URI);
    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    console.log("Querying");

    result = await collection.aggregate([
      { $match: {
        piece_id: "chop_op18", date: "2025-06-24" }
      },
      {
        $group: {
          _id: "$noteId",
          note: { $first: "$$ROOT" }
        }
      }
    ]).toArray();

  } catch(err) {
    console.log("Error: ", err);
  } finally {
    console.log({ result })
    await client.close();
  }
}


handler();
