// notion-utils.js

export function buildRepProperties(note) {
  const properties = {
    Name: {
      title: [
        { text: { content: note.title || note.piece_id || "Untitled" } }
      ]
    },
    piece_id: {
      rich_text: [
        { text: { content: note.piece_id } }
      ]
    }
  };

  if (note.composer) {
    properties.Composer = { select: { name: note.composer } };
  }
  if (note.style) {
    properties.Style = { select: { name: note.style } };
  }
  if (note.keys && note.keys.length) {
    properties.Keys = { multi_select: note.keys.map(name => ({ name })) };
  }
  if (note['Time Signature']) {
    properties["Time Signature"] = { multi_select: note['Time Signature'].map(name => ({ name })) };
  }
  if (note.status) {
    properties.Status = { select: { name: note.status } };
  }

  properties['Teacher (Vivid)'] = { status: { name: "Needs Work" } };
  properties['Memorization'] = { status: { name: "Unfamiliar" } };
  properties['Control'] = { status: { name: "Not Yet Studied" } };
  properties['Expression'] = { status: { name: "Not Yet Shaped" } };

  return properties;
}

