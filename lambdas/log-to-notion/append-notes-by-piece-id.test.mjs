import { handler } from './index.mjs';

export const testNote = {
  date: "2025-06-25",
  piece: "Prelude in C Major",
  composer: "J.S. Bach",
  piece_id: "test_piece_id_for_upsert",
  duration_minutes: 30,
  entries: [
    {
      focus: {
        measures: "m.1–4",
        page: "1",
        section: "Intro",
        book: "Well-Tempered Clavier I"
      },
      content: "Had some issues with how to use the pedal while phrasing and so many other things to. its crazy how this is just crazy",
      tags: ["tempo", "touch", "piano", "hat", "cat"],
      teacher_questions: [
        "When adding the pedal here, when is the correct time to back off?",
        "What is the best method for rubato here?"
      ]
    }
  ]
};

async function runTest() {
  // Simulate AWS API Gateway event
  const event = { body: JSON.stringify(testNote) };
  const result = await handler(event);
  console.log(result);
}

runTest();

