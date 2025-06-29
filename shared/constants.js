// Mongo names
export const DB_NAME = 'stretto_notes_gpt';
export const REP_COLLECTION_NAME = 'repertoire';
export const NOTE_COLLECTION_NAME = 'notes';

// Mongo Errors
export const MONGO_CLIENT_ERROR = "Mongo failed at client creation.";
export const MONGO_CREATE_ERROR = "Mongo failed creating note.";

// Per-field validation errors:
export const ERROR_MISSING_REP_ID = "Missing rep_id.";
export const ERROR_MISSING_NOTE_ID = "Missing note_id.";
export const ERROR_MISSING_TIME = "Missing time.";
export const ERROR_MISSING_DATE = "Missing date.";
export const ERROR_MISSING_DURATION = "Missing duration_minutes.";
export const ERROR_ENTRIES_NOT_ARRAY = "Entries must be a non-empty array.";

// General fallback
export const MISSING_SCHEMA_VALUES = "Missing keys, send all required schema values!";

