// MongoDB Configuration
export const DB_NAME = 'stretto_notes_gpt_test';
export const NOTE_COLLECTION_NAME = 'notes';
export const REP_COLLECTION_NAME = 'reps';

// Mongo Errors
export const MONGO_CLIENT_ERROR = "Mongo failed at client creation.";
export const MONGO_CREATE_ERROR = "Mongo failed to create resource.";

// Note validation errors (for note lambda)
export const ERROR_MISSING_REP_ID = "Missing rep_id.";
export const ERROR_MISSING_TITLE = "Missing title.";
export const ERROR_MISSING_NOTE_TYPE = "Missing note_type.";
export const ERROR_MISSING_ENTRIES = "Missing entries.";

// Rep validation errors (for rep lambda)
export const ERROR_MISSING_ID = "Missing rep_id.";  // rep_id field
export const ERROR_MISSING_TYPE = "Missing type.";  // type field (not note_type)

// Generic
export const ERROR_MISSING_REQUIRED_FIELD = "Missing required field.";
