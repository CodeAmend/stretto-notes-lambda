// ===== NOTE-SPECIFIC FACTORIES =====
// lambdas/note-create/test-helpers/noteFactories.js
// Exports: createValidNote(), createValidEntry()
export function createValidNote(overrides = {}) {
  const base = {
    rep_id: 'chopin_waltz_op18',
    timestamp: '2024-03-15T10:00:00Z',
    duration: 30,
    raw_content: 'Practiced the waltz today, focusing on dynamics',
    entries: [{
      content: 'Working on the opening phrase',
      type: 'discovery'
    }]
  };
  
  return { ...base, ...overrides };
}

export function createValidEntry(overrides = {}) {
  return {
    content: 'Test observation',
    type: 'discovery',
    ...overrides
  };
}
