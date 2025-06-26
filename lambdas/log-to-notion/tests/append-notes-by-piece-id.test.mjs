import { handler } from '../index.mjs';

export const testNote = {
  date: "2025-07-03",
  title: "Nocturne in E-flat Major",
  composer: "Chopin",
  piece_id: "nocturne_op9_no2",
  duration_minutes: 50,
  style: "Nocturne",           // Style select
  status: "Learning",          // Status select
  keys: ["E-flat Major"],      // Keys multi-select
  "Time Signature": ["4/4"],   // Time Signature multi-select
  entries: [
    {
      focus: {
        section: "Main Theme",
        measures: "m.1–16",
        page: "1",
        book: "Henle Edition"
      },
      content: "Worked on voicing the melody over the accompaniment. Tried practicing with extra slow hands-separate. LH needs to be lighter. Pedaling was improved.",
      tags: ["voicing", "pedal", "accompaniment", "touch"],
      teacher_questions: [
        "What’s the best finger substitution for measure 5?",
        "Should I use pedal in bars 9–10 as written?"
      ]
    },
    {
      focus: {
        section: "Middle Section",
        measures: "m.17–32",
        page: "2",
        book: "Henle Edition"
      },
      content: "Tempo was inconsistent, especially in the LH arpeggios. Consider using metronome for next session.",
      tags: ["tempo", "left hand"],
      teacher_questions: [
        "Advice for smoother arpeggios?",
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

