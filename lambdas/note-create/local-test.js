// local-test.js
import 'dotenv/config';
import { handler } from './index.js';

(async () => {
  // Mock a real event object your handler expects
  const event = {
    body: JSON.stringify({
      rep_id: "test-rep",
      note_id: "test-note",
      time: "2025-06-29T12:00:00Z",
      date: "2025-06-29",
      duration_minutes: 10,
      entries: [{ content: "Test entry" }]
    })
  };

  try {
    const result = await handler(event);
    console.log("Handler response:", result);
  } catch (err) {
    console.error("Handler error:", err);
  }
})();

