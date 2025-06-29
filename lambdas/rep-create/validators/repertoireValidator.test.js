import { describe, it, expect } from 'vitest';
import { validateRepertoire } from './repertoireValidator.js';
import { 
  expectValid, 
  expectValidationError, 
  expectValidationErrors
} from '../../../shared/test-helpers/validation.js';
import { 
  createValidRepertoire,
} from '../test-helpers/repertoireFactories.js';

describe('repertoireValidator', () => {
  describe('valid repertoire', () => {
    it('accepts minimal valid repertoire', () => {
      const rep = createValidRepertoire();
      const result = validateRepertoire(rep);
      const value = expectValid(result);
      
      // Check defaults are applied
      expect(value.status).toBe('learning');
      expect(value.on_hold).toBe('no');
      expect(value.memorized).toBe('none');
      expect(value.aliases).toEqual([]);
      expect(value.tags).toEqual([]);
      expect(value.metadata).toEqual({
        composer: 'Chopin',
        opus_info: 'Op. 18',
        keys: ['Eb major'],
        year_composed: 1833,
        difficulty: 'intermediate-advanced'
      });
    });

    it('accepts repertoire with all optional fields', () => {
      const rep = createValidRepertoire({
        aliases: ['Grande Valse Brillante', 'Grand Waltz'],
        target_date: '2024-12-15T00:00:00Z',
        tags: ['romantic', 'waltz', 'concert_piece'],
        last_practiced: '2024-03-15T10:00:00Z'
      });
      
      const result = validateRepertoire(rep);
      expectValid(result);
    });

    it('strips unknown fields', () => {
      const rep = createValidRepertoire({
        unknown_field: 'should be removed',
        metadata: {
          composer: 'Chopin',
          unknown_metadata_field: 'also removed'
        }
      });
      
      const result = validateRepertoire(rep);
      const value = expectValid(result);
      
      expect(value.unknown_field).toBeUndefined();
      expect(value.metadata.unknown_metadata_field).toBeUndefined();
    });
  });

  describe('rep_id validation', () => {
    const repIdTests = [
      { rep_id: undefined, valid: false, reason: 'missing' },
      { rep_id: '', valid: false, reason: 'empty' },
      { rep_id: 'bach_invention_8', valid: true, reason: 'valid lowercase with underscores' },
      { rep_id: 'mozart_k331_3rd_movement', valid: true, reason: 'valid with numbers' },
      { rep_id: 'Chopin_Waltz', valid: false, reason: 'contains uppercase' },
      { rep_id: 'chopin-waltz-op18', valid: false, reason: 'contains hyphens' },
      { rep_id: 'chopin waltz', valid: false, reason: 'contains space' },
      { rep_id: 'chopin.waltz', valid: false, reason: 'contains period' },
      { rep_id: 'chopin@waltz', valid: false, reason: 'contains special char' }
    ];

    repIdTests.forEach(({ rep_id, valid, reason }) => {
      it(`${valid ? 'accepts' : 'rejects'} rep_id: "${rep_id}" (${reason})`, () => {
        const rep = createValidRepertoire({ rep_id });
        const result = validateRepertoire(rep);
        
        if (valid) {
          expectValid(result);
        } else {
          expectValidationError(result, 'rep_id');
        }
      });
    });
  });

  describe('name and display_name validation', () => {
    it('rejects missing name', () => {
      const rep = createValidRepertoire({ name: undefined });
      const result = validateRepertoire(rep);
      expectValidationError(result, 'name', 'required');
    });

    it('rejects empty name', () => {
      const rep = createValidRepertoire({ name: '' });
      const result = validateRepertoire(rep);
      expectValidationError(result, 'name', 'empty');
    });

    it('rejects name over 200 characters', () => {
      const rep = createValidRepertoire({ name: 'a'.repeat(201) });
      const result = validateRepertoire(rep);
      expectValidationError(result, 'name', 'less than or equal to 200');
    });

    it('rejects missing display_name', () => {
      const rep = createValidRepertoire({ display_name: undefined });
      const result = validateRepertoire(rep);
      expectValidationError(result, 'display_name', 'required');
    });

    it('accepts different name formats', () => {
      const names = [
        'Sonata No. 14 in C-sharp minor, Op. 27, No. 2',
        'Prélude à l\'après-midi d\'un faune',
        '12 Études, Op. 10: No. 3 in E major "Tristesse"',
        'WTC Book I: Prelude & Fugue No. 1 in C major, BWV 846'
      ];
      
      names.forEach(name => {
        const rep = createValidRepertoire({ name, display_name: name });
        const result = validateRepertoire(rep);
        expectValid(result);
      });
    });
  });

  describe('status validation', () => {
    const statusTests = [
      { status: 'learning', valid: true },
      { status: 'polishing', valid: true },
      { status: 'performance_ready', valid: true },
      { status: 'not_started', valid: false },
      { status: 'paused', valid: false },
      { status: 'memorizing', valid: false },
      { status: 'completed', valid: false },
      { status: '', valid: false }
    ];

    statusTests.forEach(({ status, valid }) => {
      it(`${valid ? 'accepts' : 'rejects'} status: "${status}"`, () => {
        const rep = createValidRepertoire({ status });
        const result = validateRepertoire(rep);
        
        if (valid) {
          expectValid(result);
        } else {
          expectValidationError(result, 'status', 'must be one of');
        }
      });
    });
  });

  describe('on_hold validation', () => {
    const onHoldTests = [
      { on_hold: 'no', valid: true },
      { on_hold: 'archived', valid: true },
      { on_hold: 'too_difficult', valid: true },
      { on_hold: 'seasonal', valid: true },
      { on_hold: 'lost_interest', valid: true },
      { on_hold: 'none', valid: false },
      { on_hold: 'yes', valid: false },
      { on_hold: 'paused', valid: false },
      { on_hold: '', valid: false },
      { on_hold: true, valid: false }
    ];

    onHoldTests.forEach(({ on_hold, valid }) => {
      it(`${valid ? 'accepts' : 'rejects'} on_hold: "${on_hold}"`, () => {
        const rep = createValidRepertoire({ on_hold });
        const result = validateRepertoire(rep);
        
        if (valid) {
          expectValid(result);
        } else {
          expectValidationError(result, 'on_hold', 'must be one of');
        }
      });
    });
  });

  describe('memorized validation', () => {
    const memorizedTests = [
      { memorized: 'none', valid: true },
      { memorized: 'shaky', valid: true },
      { memorized: 'confident', valid: true },
      { memorized: 'solid', valid: true },
      { memorized: 'partial', valid: false },
      { memorized: 'yes', valid: false },
      { memorized: true, valid: false }
    ];

    memorizedTests.forEach(({ memorized, valid }) => {
      it(`${valid ? 'accepts' : 'rejects'} memorized: "${memorized}"`, () => {
        const rep = createValidRepertoire({ memorized });
        const result = validateRepertoire(rep);
        
        if (valid) {
          expectValid(result);
        } else {
          expectValidationError(result, 'memorized', 'must be one of');
        }
      });
    });
  });

  describe('metadata validation', () => {
    it('accepts empty metadata object', () => {
      const rep = createValidRepertoire({ metadata: {} });
      const result = validateRepertoire(rep);
      expectValid(result);
    });

    it('accepts partial metadata', () => {
      const rep = createValidRepertoire({
        metadata: {
          composer: 'Mozart',
          keys: ['G major']
        }
      });
      const result = validateRepertoire(rep);
      expectValid(result);
    });

    it('validates year_composed range', () => {
      const yearTests = [
        { year: 999, valid: false },
        { year: 1000, valid: true },
        { year: 1750, valid: true },
        { year: 2024, valid: true },
        { year: 2100, valid: true },
        { year: 2101, valid: false },
        { year: 'not a year', valid: false }
      ];

      yearTests.forEach(({ year, valid }) => {
        const rep = createValidRepertoire({
          metadata: { year_composed: year }
        });
        const result = validateRepertoire(rep);
        
        if (valid) {
          expectValid(result);
        } else {
          expectValidationError(result, 'metadata.year_composed');
        }
      });
    });

    it('validates keys array', () => {
      const rep = createValidRepertoire({
        metadata: {
          keys: ['C major', 'A minor', 'F# major']
        }
      });
      const result = validateRepertoire(rep);
      expectValid(result);
    });

    it('rejects non-string keys', () => {
      const rep = createValidRepertoire({
        metadata: {
          keys: ['C major', 123, 'A minor']
        }
      });
      const result = validateRepertoire(rep);
      expectValidationError(result, 'metadata.keys.1', 'must be a string');
    });
  });

  describe('aliases validation', () => {
    it('applies empty array default when not provided', () => {
      const rep = createValidRepertoire();
      delete rep.aliases;
      const result = validateRepertoire(rep);
      const value = expectValid(result);
      expect(value.aliases).toEqual([]);
    });

    it('accepts array of string aliases', () => {
      const rep = createValidRepertoire({
        aliases: ['Moonlight Sonata', 'Sonata quasi una fantasia']
      });
      const result = validateRepertoire(rep);
      expectValid(result);
    });

    it('rejects non-string aliases', () => {
      const rep = createValidRepertoire({
        aliases: ['Valid alias', 123]
      });
      const result = validateRepertoire(rep);
      expectValidationError(result, 'aliases.1', 'must be a string');
    });
  });

  describe('date validation', () => {
    describe('started_date', () => {
      const dateTests = [
        { date: '2024-01-01T00:00:00Z', valid: true, reason: 'valid ISO string' },
        { date: '2024-01-01', valid: false, reason: 'date only, missing time' },
        { date: 'January 1, 2024', valid: false, reason: 'wrong format' },
        { date: new Date().toISOString(), valid: true, reason: 'current date' }
      ];

      dateTests.forEach(({ date, valid, reason }) => {
        it(`${valid ? 'accepts' : 'rejects'} started_date: "${date}" (${reason})`, () => {
          const rep = createValidRepertoire({ started_date: date });
          const result = validateRepertoire(rep);
          
          if (valid) {
            expectValid(result);
          } else {
            expectValidationError(result, 'started_date');
          }
        });
      });

      it('applies default started_date when not provided', () => {
        const rep = createValidRepertoire();
        delete rep.started_date;
        const result = validateRepertoire(rep);
        const value = expectValid(result);
        expect(value.started_date).toBeDefined();
        expect(new Date(value.started_date)).toBeInstanceOf(Date);
      });
    });

    describe('target_date', () => {
      it('accepts null target_date', () => {
        const rep = createValidRepertoire({ target_date: null });
        const result = validateRepertoire(rep);
        expectValid(result);
      });

      it('accepts valid future date', () => {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        const rep = createValidRepertoire({ 
          target_date: futureDate.toISOString() 
        });
        const result = validateRepertoire(rep);
        expectValid(result);
      });

      it('accepts past target_date (for historical records)', () => {
        const rep = createValidRepertoire({ 
          target_date: '2023-01-01T00:00:00Z' 
        });
        const result = validateRepertoire(rep);
        expectValid(result);
      });
    });
  });

  describe('tags validation', () => {
    it('applies empty array default when not provided', () => {
      const rep = createValidRepertoire();
      delete rep.tags;
      const result = validateRepertoire(rep);
      const value = expectValid(result);
      expect(value.tags).toEqual([]);
    });

    it('accepts various tag formats', () => {
      const rep = createValidRepertoire({
        tags: ['romantic', 'waltz', 'concert-piece', 'grade_8', '19th-century']
      });
      const result = validateRepertoire(rep);
      expectValid(result);
    });

    it('rejects non-string tags', () => {
      const rep = createValidRepertoire({
        tags: ['valid', 123, true]
      });
      const result = validateRepertoire(rep);
      expectValidationError(result, 'tags.1', 'must be a string');
    });
  });

  describe('complex validation scenarios', () => {
    it('reports multiple validation errors', () => {
      const rep = {
        // Missing required fields
        status: 'memorizing',
        on_hold: 'yes',
        memorized: 'yes',
        metadata: {
          year_composed: 500
        },
        aliases: ['valid', 123],
        tags: [true, false]
      };
      
      const result = validateRepertoire(rep);
      expectValidationErrors(result, [
        { field: 'rep_id', messageContains: 'required' },
        { field: 'name', messageContains: 'required' },
        { field: 'display_name', messageContains: 'required' },
        { field: 'status', messageContains: 'must be one of' },
        { field: 'on_hold', messageContains: 'must be one of' },
        { field: 'memorized', messageContains: 'must be one of' },
        { field: 'metadata.year_composed', messageContains: 'greater than or equal to 1000' }
      ]);
    });

    it('validates realistic repertoire entries', () => {
      const pieces = [
        {
          rep_id: 'bach_invention_13',
          name: 'Invention No. 13 in A minor, BWV 784',
          display_name: 'Bach Invention No. 13',
          status: 'performance_ready',
          on_hold: 'no',
          metadata: {
            composer: 'J.S. Bach',
            opus_info: 'BWV 784',
            keys: ['A minor'],
            year_composed: 1723,
            difficulty: 'intermediate'
          }
        },
        {
          rep_id: 'chopin_etude_op10_no3',
          name: 'Étude Op. 10, No. 3 in E major',
          display_name: 'Chopin Étude Op. 10 No. 3 "Tristesse"',
          aliases: ['Tristesse', 'Etude in E major'],
          status: 'polishing',
          on_hold: 'too_difficult',
          metadata: {
            composer: 'Frédéric Chopin',
            opus_info: 'Op. 10 No. 3',
            keys: ['E major'],
            year_composed: 1832,
            difficulty: 'advanced'
          },
          tags: ['romantic', 'etude', 'lyrical']
        },
        {
          rep_id: 'debussy_clair_de_lune',
          name: 'Suite bergamasque, L. 75: III. Clair de lune',
          display_name: 'Clair de Lune',
          status: 'performance_ready',
          on_hold: 'archived',
          memorized: 'solid',
          metadata: {
            composer: 'Claude Debussy',
            opus_info: 'L. 75',
            keys: ['Db major'],
            year_composed: 1905,
            difficulty: 'intermediate-advanced'
          },
          tags: ['impressionist', 'suite', 'popular']
        },
        {
          rep_id: 'christmas_carol_medley',
          name: 'Christmas Carol Medley Arrangement',
          display_name: 'Christmas Medley',
          status: 'performance_ready',
          on_hold: 'seasonal',
          memorized: 'confident',
          tags: ['christmas', 'arrangement', 'seasonal']
        }
      ];

      pieces.forEach(piece => {
        const rep = createValidRepertoire(piece);
        const result = validateRepertoire(rep);
        expectValid(result);
      });
    });

    it('validates common use cases', () => {
      // Piece you're actively learning
      const activeLearning = createValidRepertoire({
        status: 'learning',
        on_hold: 'no',
        memorized: 'shaky'
      });
      expectValid(validateRepertoire(activeLearning));

      // Piece that's ready but only played at Christmas
      const christmasPiece = createValidRepertoire({
        status: 'performance_ready',
        on_hold: 'seasonal',
        memorized: 'solid'
      });
      expectValid(validateRepertoire(christmasPiece));

      // Piece you started but found too hard
      const tooHard = createValidRepertoire({
        status: 'learning',
        on_hold: 'too_difficult',
        memorized: 'none'
      });
      expectValid(validateRepertoire(tooHard));

      // Piece you mastered but don't play anymore
      const archived = createValidRepertoire({
        status: 'performance_ready',
        on_hold: 'archived',
        memorized: 'solid'
      });
      expectValid(validateRepertoire(archived));
    });
  });
});
