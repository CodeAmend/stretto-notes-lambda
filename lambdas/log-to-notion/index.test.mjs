import { handler } from './index.mjs';
import dotenv from 'dotenv';
dotenv.config();


const event = {
  body: JSON.stringify({
    piece: "Etude in A Minor (Test Entry)",
    piece_id: "test_piece_001",
    composer: "Fictional Composer",
    style: "Etude"
  })
};

handler(event)
  .then(response => {
    console.log('[Lambda Response]', response);
  })
  .catch(error => {
    console.error('[Lambda Error]', error);
  });
