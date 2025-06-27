// run-lambda-locally.js
import { handler } from './index.mjs'; 

const [,,date, piece_id] = process.argv;

const testEvent = {
  body: JSON.stringify({
    date,
    piece_id
  })
};

handler(testEvent)
  .then(res => {
    console.log("Lambda result:", res);
    process.exit(0);
  })
  .catch(err => {
    console.error("Lambda error:", err);
    process.exit(1);
  });

