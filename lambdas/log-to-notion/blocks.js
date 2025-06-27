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

  // Compose each part for rich_text, marking 'measures' bold
  const richText = [
    { type: 'text', text: { content: "Focus: " } }, // Label

    // Section (if present)
    ...(entry.focus.section ? [
      { type: 'text', text: { content: entry.focus.section + ', ' } }
    ] : []),

    // Measures (if present, bold)
    ...(entry.focus.measures ? [
      { type: 'text', text: { content: entry.focus.measures }, annotations: { bold: true } }
    ] : []),

    // Add a comma and space if both measures and another part follow
    ...(entry.focus.measures && (entry.focus.page || entry.focus.book) ? [
      { type: 'text', text: { content: ', ' } }
    ] : []),

    // Page (if present)
    ...(entry.focus.page ? [
      { type: 'text', text: { content: `page ${entry.focus.page}` } }
    ] : []),

    // Add a comma and space if both page and book follow
    ...(entry.focus.page && entry.focus.book ? [
      { type: 'text', text: { content: ', ' } }
    ] : []),

    // Book (if present)
    ...(entry.focus.book ? [
      { type: 'text', text: { content: entry.focus.book } }
    ] : [])
  ];

  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: richText,
      color: 'default'
    }
  };
}


export function notesContentBlock(content) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: 'text', text: { content } }
      ],
      color: 'gray_background'
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

