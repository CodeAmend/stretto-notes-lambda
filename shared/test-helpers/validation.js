import { expect } from "vitest";
// ===== SHARED VALIDATION HELPERS =====
// shared/test-helpers/validation.js
// Exports: expectValid(), expectValidationError(), expectValidationErrors(), runValidationTests()
// Generic validation test helpers - used by all Lambda tests

export function expectValid(result) {
  expect(result.valid).toBe(true);
  return result.value;
}

export function expectValidationError(result, field, messageContains) {
  expect(result.valid).toBe(false);
  const error = result.errors.find(e => e.field === field);
  expect(error).toBeDefined();
  if (messageContains) {
    expect(error.message).toContain(messageContains);
  }
  return error;
}

export function expectValidationErrors(result, expectedErrors) {
  expect(result.valid).toBe(false);
  expectedErrors.forEach(({ field, messageContains }) => {
    const error = result.errors.find(e => e.field === field);
    expect(error).toBeDefined();
    if (messageContains) {
      expect(error.message).toContain(messageContains);
    }
  });
}

// Table-driven test helper
// Best for testing a single validation function with different inputs
// Example: testing a validateRepId(id) function
export function runValidationTests(validateFn, tests) {
  tests.forEach(({ input, valid, field, reason }) => {
    it(`${valid ? 'accepts' : 'rejects'} ${field || 'input'} (${reason})`, () => {
      const result = validateFn(input);
      
      if (valid) {
        expectValid(result);
      } else {
        expectValidationError(result, field);
      }
    });
  });
}
