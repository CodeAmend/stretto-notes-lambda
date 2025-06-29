// ===== NOTE VALIDATOR TESTS =====

import { describe, it, expect } from 'vitest';
import { validateNote } from './noteValidator.js';
import { 
  expectValid, 
  expectValidationError, 
  expectValidationErrors
} from '../../../shared/test-helpers/validation.js';
import { 
  createValidNote, 
  createValidEntry 
} from '../test-helpers/noteFactories.js';

describe('noteValidator', () => {
  describe('valid notes', () => {
    it('accepts minimal valid note', () => {
      const note = createValidNote();
      const result = validateNote(note);
      const value = expectValid(result);
      
      // Check defaults are applied
      expect(value.exercise_ids).toEqual([]);
      expect(value.entries[0].tags).toEqual([]);
    });

    it('accepts note with all optional fields', () => {
      const note = createValidNote({
        exercise_ids: ['major_scales', 'arpeggios'],
        entries: [{
          measures: '44 and 55',
          content: 'Difficult passage with far jumps',
          tags: ['technical', 'fingering'],
          type: 'challenge'
        }]
      });
      
      const result = validateNote(note);
      expectValid(result);
    });

    it('strips unknown fields', () => {
      const note = createValidNote({
        unknown_field: 'should be removed',
        entries: [{
          content: 'Test',
          type: 'discovery',
          unknown_entry_field: 'also removed'
        }]
      });
      
      const result = validateNote(note);
      const value = expectValid(result);
      
      expect(value.unknown_field).toBeUndefined();
      expect(value.entries[0].unknown_entry_field).toBeUndefined();
    });
  });

  describe('rep_id validation', () => {
    const repIdTests = [
      { rep_id: undefined, valid: false, reason: 'missing' },
      { rep_id: '', valid: false, reason: 'empty' },
      { rep_id: 'chopin_waltz_op18', valid: true, reason: 'valid lowercase with underscores' },
      { rep_id: 'bach_invention_8', valid: true, reason: 'valid with number' },
      { rep_id: 'Chopin_Waltz', valid: false, reason: 'contains uppercase' },
      { rep_id: 'chopin-waltz', valid: false, reason: 'contains hyphen' },
      { rep_id: 'chopin waltz', valid: false, reason: 'contains space' },
      { rep_id: 'chopin.waltz', valid: false, reason: 'contains period' }
    ];

    repIdTests.forEach(({ rep_id, valid, reason }) => {
      it(`${valid ? 'accepts' : 'rejects'} rep_id: "${rep_id}" (${reason})`, () => {
        const note = createValidNote({ rep_id });
        const result = validateNote(note);
        
        if (valid) {
          expectValid(result);
        } else {
          expectValidationError(result, 'rep_id');
        }
      });
    });
  });

  describe('timestamp validation', () => {
    const timestampTests = [
      { timestamp: undefined, valid: false, reason: 'missing' },
      { timestamp: '2024-03-15T10:00:00Z', valid: true, reason: 'valid ISO string' },
      { timestamp: '2024-03-15T10:00:00.000Z', valid: true, reason: 'valid with milliseconds' },
      { timestamp: '2024-03-15', valid: false, reason: 'date only, missing time' },
      { timestamp: 'not a date', valid: false, reason: 'invalid format' },
      { timestamp: '03/15/2024', valid: false, reason: 'wrong date format' }
    ];

    timestampTests.forEach(({ timestamp, valid, reason }) => {
      it(`${valid ? 'accepts' : 'rejects'} timestamp: "${timestamp}" (${reason})`, () => {
        const note = createValidNote({ timestamp });
        const result = validateNote(note);
        
        if (valid) {
          expectValid(result);
        } else {
          expectValidationError(result, 'timestamp');
        }
      });
    });
  });

  describe('duration validation', () => {
    const durationTests = [
      { duration: undefined, valid: false, reason: 'missing' },
      { duration: 0, valid: false, reason: 'too small' },
      { duration: 1, valid: true, reason: 'minimum valid' },
      { duration: 30, valid: true, reason: 'typical session' },
      { duration: 480, valid: true, reason: 'maximum valid (8 hours)' },
      { duration: 481, valid: false, reason: 'exceeds maximum' },
      { duration: 30.5, valid: false, reason: 'not integer' },
      { duration: '30', valid: false, reason: 'string instead of number' },
      { duration: -10, valid: false, reason: 'negative' }
    ];

    durationTests.forEach(({ duration, valid, reason }) => {
      it(`${valid ? 'accepts' : 'rejects'} duration: ${duration} (${reason})`, () => {
        const note = createValidNote({ duration });
        const result = validateNote(note);
        
        if (valid) {
          expectValid(result);
        } else {
          expectValidationError(result, 'duration');
        }
      });
    });
  });

  describe('raw_content validation', () => {
    it('rejects missing raw_content', () => {
      const note = createValidNote({ raw_content: undefined });
      const result = validateNote(note);
      expectValidationError(result, 'raw_content', 'required');
    });

    it('rejects empty raw_content', () => {
      const note = createValidNote({ raw_content: '' });
      const result = validateNote(note);
      expectValidationError(result, 'raw_content', 'empty');
    });

    it('accepts long raw_content up to limit', () => {
      const longContent = 'a'.repeat(10000);
      const note = createValidNote({ raw_content: longContent });
      const result = validateNote(note);
      expectValid(result);
    });

    it('rejects raw_content over 10000 characters', () => {
      const tooLong = 'a'.repeat(10001);
      const note = createValidNote({ raw_content: tooLong });
      const result = validateNote(note);
      expectValidationError(result, 'raw_content', 'less than or equal to 10000');
    });
  });

  describe('entries validation', () => {
    it('rejects missing entries', () => {
      const note = createValidNote({ entries: undefined });
      const result = validateNote(note);
      expectValidationError(result, 'entries', 'required');
    });

    it('rejects empty entries array', () => {
      const note = createValidNote({ entries: [] });
      const result = validateNote(note);
      expectValidationError(result, 'entries', 'at least 1');
    });

    it('accepts multiple entries', () => {
      const note = createValidNote({
        entries: [
          createValidEntry({ type: 'discovery' }),
          createValidEntry({ type: 'challenge' }),
          createValidEntry({ type: 'question' })
        ]
      });
      const result = validateNote(note);
      expectValid(result);
    });
  });

  describe('entry type validation', () => {
    const validTypes = ['question', 'breakthrough', 'discovery', 'challenge', 'love', 'confusion'];
    
    validTypes.forEach(type => {
      it(`accepts entry type: ${type}`, () => {
        const note = createValidNote({
          entries: [createValidEntry({ type })]
        });
        const result = validateNote(note);
        expectValid(result);
      });
    });

    it('rejects invalid entry type', () => {
      const note = createValidNote({
        entries: [createValidEntry({ type: 'invalid_type' })]
      });
      const result = validateNote(note);
      expectValidationError(result, 'entries.0.type', 'must be one of');
    });
  });

  describe('entry content validation', () => {
    const contentTests = [
      { content: undefined, valid: false, reason: 'missing' },
      { content: '', valid: false, reason: 'empty' },
      { content: 'A', valid: true, reason: 'single character' },
      { content: 'Normal observation about practice', valid: true, reason: 'typical content' },
      { content: 'a'.repeat(1000), valid: true, reason: 'maximum length' },
      { content: 'a'.repeat(1001), valid: false, reason: 'exceeds maximum' }
    ];

    contentTests.forEach(({ content, valid, reason }) => {
      it(`${valid ? 'accepts' : 'rejects'} entry content (${reason})`, () => {
        const note = createValidNote({
          entries: [createValidEntry({ content })]
        });
        const result = validateNote(note);
        
        if (valid) {
          expectValid(result);
        } else {
          expectValidationError(result, 'entries.0.content');
        }
      });
    });
  });

  describe('measures validation', () => {
    const measuresTests = [
      { measures: undefined, valid: true, reason: 'optional field' },
      { measures: '', valid: true, reason: 'empty string allowed' },
      { measures: '44', valid: true, reason: 'single measure' },
      { measures: '44 and 55', valid: true, reason: 'non-consecutive measures' },
      { measures: '32-36', valid: true, reason: 'measure range' },
      { measures: 'development section', valid: true, reason: 'section name' },
      { measures: 'mm. 44-48', valid: true, reason: 'with prefix' },
      { measures: 'around measure 100', valid: true, reason: 'approximate reference' }
    ];

    measuresTests.forEach(({ measures, valid, reason }) => {
      it(`accepts measures: "${measures}" (${reason})`, () => {
        const note = createValidNote({
          entries: [createValidEntry({ measures })]
        });
        const result = validateNote(note);
        expectValid(result);
      });
    });
  });

  describe('tags validation', () => {
    it('applies empty array default when tags not provided', () => {
      const note = createValidNote({
        entries: [{ content: 'Test', type: 'discovery' }]
      });
      const result = validateNote(note);
      const value = expectValid(result);
      expect(value.entries[0].tags).toEqual([]);
    });

    it('accepts array of string tags', () => {
      const note = createValidNote({
        entries: [createValidEntry({ 
          tags: ['technical', 'fingering', 'dynamics'] 
        })]
      });
      const result = validateNote(note);
      expectValid(result);
    });


    it('rejects non-string tags', () => {
      const note = createValidNote({
        entries: [createValidEntry({ 
          tags: ['valid', 123, 'another'] 
        })]
      });
      const result = validateNote(note);
      expectValidationError(result, 'entries.0.tags.1', 'must be a string');
    });

  });

  describe('exercise_ids validation', () => {
    it('applies empty array default when not provided', () => {
      const note = createValidNote();
      delete note.exercise_ids;
      const result = validateNote(note);
      const value = expectValid(result);
      expect(value.exercise_ids).toEqual([]);
    });

    it('accepts array of exercise ids', () => {
      const note = createValidNote({
        exercise_ids: ['major_scales', 'arpeggios', '251_progressions']
      });
      const result = validateNote(note);
      expectValid(result);
    });

    it('rejects non-string exercise ids', () => {
      const note = createValidNote({
        exercise_ids: ['valid', 123]
      });
      const result = validateNote(note);
      expectValidationError(result, 'exercise_ids.1', 'must be a string');
    });
  });

  describe('complex validation scenarios', () => {
    it('reports multiple validation errors', () => {
      const note = {
        // Missing rep_id
        timestamp: 'invalid date',
        duration: 'not a number',
        raw_content: '',
        entries: []
      };
      
      const result = validateNote(note);
      expectValidationErrors(result, [
        { field: 'rep_id', messageContains: 'required' },
        { field: 'timestamp', messageContains: 'ISO 8601' },  // Changed from 'must be a valid date'
        { field: 'duration', messageContains: 'must be a number' },
        { field: 'raw_content', messageContains: 'empty' },
        { field: 'entries', messageContains: 'at least 1' }
      ]);
    });

    it('validates nested entry errors', () => {
      const note = createValidNote({
        entries: [
          { content: '', type: 'invalid' },
          { content: 'a'.repeat(1001), type: 'discovery' }
        ]
      });
      
      const result = validateNote(note);
      expectValidationErrors(result, [
        { field: 'entries.0.content', messageContains: 'empty' },
        { field: 'entries.0.type', messageContains: 'must be one of' },
        { field: 'entries.1.content', messageContains: 'less than or equal to 1000' }
      ]);
    });
  });
});

// ===== USAGE NOTES =====
// 1. Generic validation helpers go in shared/test-helpers/validation.js
// 2. Domain-specific factories go in each lambda's test-helpers folder
// 3. Table-driven tests reduce boilerplate for similar test cases
// 4. Use expectValid() when you need the validated value
// 5. Use expectValidationError() for single field errors
// 6. Use expectValidationErrors() for multiple field errors
//
// Repertoire tests import the same shared helpers:
// import { expectValid, expectValidationError } from '../../../shared/test-helpers/validation.js';
// import { createValidRepertoire } from '../test-helpers/repertoireFactories.js';
