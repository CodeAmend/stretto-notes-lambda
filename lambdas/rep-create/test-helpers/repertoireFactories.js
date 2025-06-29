export function createValidRepertoire(overrides = {}) {
  return {
    rep_id: 'chopin_waltz_op18',
    name: 'Waltz in E-flat major, Op. 18',
    display_name: 'Chopin Waltz Op. 18',
    importance: 'active',
    status: 'learning',
    memorized: 'none',
    metadata: {
      composer: 'Chopin',
      opus_info: 'Op. 18',
      keys: ['Eb major'],
      year_composed: 1833,
      difficulty: 'intermediate-advanced'
    },
    aliases: [],
    target_date: null,
    started_date: '2024-01-01T00:00:00Z',
    tags: [],
    ...overrides
  };
}

export function createValidMetadata(overrides = {}) {
  return {
    composer: 'Bach',
    opus_info: 'BWV 846',
    keys: ['C major'],
    year_composed: 1722,
    difficulty: 'intermediate',
    ...overrides
  };
}
