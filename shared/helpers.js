import {
  ERROR_MISSING_REP_ID,
  ERROR_MISSING_NOTE_ID,
  ERROR_MISSING_TIME,
  ERROR_MISSING_DATE,
  ERROR_MISSING_DURATION,
  ERROR_ENTRIES_NOT_ARRAY
} from './constants.js';

export function validateNoteBody(body) {
  if (!body.rep_id) return ERROR_MISSING_REP_ID;
  if (!body.note_id) return ERROR_MISSING_NOTE_ID;
  if (!body.time) return ERROR_MISSING_TIME;
  if (!body.date) return ERROR_MISSING_DATE;
  if (!body.duration_minutes) return ERROR_MISSING_DURATION;
  if (!Array.isArray(body.entries) || body.entries.length === 0)
    return ERROR_ENTRIES_NOT_ARRAY;
  return null; // valid!
}

export function returnResponse(statusCode, errorMessage) {
  return {
    statusCode,
    body: JSON.stringify({ ok: false, error: errorMessage })
  }
}

export function returnSuccessResponse(statusCode) {
  return {
    statusCode,
    body: JSON.stringify({ ok: true })
  }
}

