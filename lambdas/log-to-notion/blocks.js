// blocks.js



// Practice Log heading block
export function practiceLogHeadingBlock() {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [
        { type: 'text', text: { content: '🎹 Practice Log' } }
      ],
      is_toggleable: false,
      color: 'default'
    }
  };
}

// Toggle block for a date (children are noteSections)
export function dateToggleBlock(date, children) {
  return {
    object: 'block',
    type: 'toggle',
    toggle: {
      rich_text: [{ type: 'text', text: { content: date } }],
      children 
    }
  };
}

// Toggle for a single note/session (children are entry blocks)
export function noteSectionBlock(label, children) {
  return {
    object: 'block',
    type: 'toggle',
    toggle: {
      rich_text: [{ type: 'text', text: { content: label } }],
      children
    }
  };
}

// Leaf blocks
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

export function questionsBullets(questions) {
  return (questions || []).map(q => ({
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content: q } }]
    }
  }));
}

export function spacerBlock() {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [] }
  };
}

