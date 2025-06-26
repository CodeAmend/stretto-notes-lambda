import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const REPERTOIRE_DB_ID = process.env.REPERTOIRE_DB_ID;
const TARGET_PIECE_ID = 'test_piece_id_for_upsert';

const note = {
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

// FOCUS + TAGS (blue callout)
function tagsBoldUnderlineSection(tags) {
  if (!tags || !tags.length) return [];
  // Emoji at start, each tag bold and underlined, separated by dot
  const richText = [
    { type: 'text', text: { content: "🏷️ " } },
    ...tags.map((tag, i) => [
      i > 0
        ? { type: 'text', text: { content: " • " } }
        : null,
      {
        type: 'text',
        text: { content: tag },
        annotations: { bold: true, underline: true }
      }
    ]).flat().filter(Boolean)
  ];
  return [{
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: richText
    }
  }];
}
function focusBlueCallout(entry) {
  if (!entry.focus || !Object.values(entry.focus).some(Boolean)) return [];
  const focusParts = [
    entry.focus.section,
    entry.focus.measures,
    entry.focus.page && `page ${entry.focus.page}`,
    entry.focus.book
  ].filter(Boolean);

  return [{
    object: 'block',
    type: 'callout',
    callout: {
      icon: { type: "emoji", emoji: "🎯" },
      rich_text: [
        { type: 'text', text: { content: "Focus: " + focusParts.join(', ') } }
      ],
      color: 'blue_background'
    }
  }];
}


// "📌 Notes:" label as a paragraph block (not a callout)
function notesLabelBlock() {
  return [{
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "📌 Notes:" } }
      ]
    }
  }];
}

// Content in gray callout (no icon or label in the callout itself)
function notesGrayCallout(content) {
  return [{
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: 'text', text: { content } }
      ],
      color: 'gray_background'
    }
  }];
}

// TEACHER QUESTIONS (❓ plain label, no formatting)
function teacherQuestionsSection(questions) {
  if (!questions || !questions.length) return [];
  const titleBlock = {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: 'text', text: { content: "❓ Teacher Questions" } }
      ]
    }
  };
  const bullets = questions.map(q => ({
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content: q } }]
    }
  }));
  return [titleBlock, ...bullets];
}

const spacerBlock = {
  object: 'block',
  type: 'paragraph',
  paragraph: { rich_text: [] }
};

function formatEntryBlock(entry) {
  return [
    ...tagsBoldUnderlineSection(entry.tags),
    ...focusBlueCallout(entry),
    ...notesLabelBlock(),
    ...notesGrayCallout(entry.content),
    ...teacherQuestionsSection(entry.teacher_questions),
    spacerBlock
  ];
}

async function run() {
  // Find the page for this test piece_id
  const dbRes = await notion.databases.query({
    database_id: REPERTOIRE_DB_ID,
    filter: {
      property: "piece_id",
      rich_text: { equals: TARGET_PIECE_ID }
    }
  });

  const page = dbRes.results[0];
  if (!page) {
    console.log('❌ No page found with that piece_id.');
    return;
  }

  // Compose new blocks (heading + entry blocks)
  const newNoteBlocks = [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [
          { type: 'text', text: { content: `${note.date} — Practice Session (${note.duration_minutes} min)` } }
        ],
        is_toggleable: false,
        color: 'default'
      }
    },
    ...note.entries.flatMap(formatEntryBlock)
  ];

  // Append only (no prepend for speed)
  await notion.blocks.children.append({
    block_id: page.id,
    children: newNoteBlocks
  });

  console.log('✅ Appended structured practice note to test page:', page.id);
}

run();

