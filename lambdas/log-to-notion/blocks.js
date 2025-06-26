
// Title block (session heading)
export function titleBlock(text) {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [
        { type: 'text', text: { content: text } }
      ],
      is_toggleable: false,
      color: 'default'
    }
  };
}

// Tags row (emoji, bold+underline, dot separator)
export function tagBlock(tags) {
  if (!tags || !tags.length) return null;
  const richText = [
    { type: 'text', text: { content: "🏷️ " } },
    ...tags.map((tag, i) => [
      i > 0 ? { type: 'text', text: { content: ' • ' } } : null,
      {
        type: 'text',
        text: { content: tag },
        annotations: { bold: true, underline: true }
      }
    ]).flat().filter(Boolean)
  ];
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: richText }
  };
}

// Focus callout (blue)
export function focusBlock(entry) {
  if (!entry.focus || !Object.values(entry.focus).some(Boolean)) return null;
  const focusParts = [
    entry.focus.section,
    entry.focus.measures,
    entry.focus.page && `page ${entry.focus.page}`,
    entry.focus.book
  ].filter(Boolean);
  return {
    object: 'block',
    type: 'callout',
    callout: {
      icon: { type: "emoji", emoji: "🎯" },
      rich_text: [
        { type: 'text', text: { content: "Focus: " + focusParts.join(', ') } }
      ],
      color: 'blue_background'
    }
  };
}

// Notes label (paragraph)
export function notesLabelBlock() {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "📌 Notes:" } }
      ]
    }
  };
}

// Notes content (yellow callout with lightbulb icon)
export function notesContentBlock(content) {
  return {
    object: 'block',
    type: 'callout',
    callout: {
      icon: { type: "emoji", emoji: "💡" },
      rich_text: [
        { type: 'text', text: { content } }
      ],
      color: 'yellow_background'
    }
  };
}

// Teacher questions label (paragraph)
export function questionsLabelBlock() {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: 'text', text: { content: "❓ Teacher Questions" } }
      ]
    }
  };
}

// Teacher questions as bullet list
export function questionsBullets(questions) {
  return (questions || []).map(q => ({
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content: q } }]
    }
  }));
}

// Spacer for separation
export function spacerBlock() {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [] }
  };
}

// Build all blocks for a single practice entry

