export function createValidRepertoire(overrides = {}) {
  return {
    rep_id: 'chopin_waltz_op18',
    name: 'Grande Valse Brillante in E-flat major, Op. 18',
    display_name: 'Chopin Waltz Op. 18',
    status: 'Learning',
    on_hold: 'No',
    memorized: 'None',
    metadata: {
      composer: 'Chopin',
      opus_info: 'Op. 18',
      keys: ['Eb major'],
      year_composed: 1833,
      difficulty: 'intermediate-advanced'
    },
    aliases: [],
    tags: [],
    started_date: new Date().toISOString(),
    target_date: null,
    // Remove any importance field
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
