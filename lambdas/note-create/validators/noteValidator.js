// validators/noteValidator.js
import Joi from 'joi';

const entryTypes = ['question', 'breakthrough', 'discovery', 'challenge', 'love', 'confusion'];

const entrySchema = Joi.object({
  measures: Joi.string().allow('').optional(),
  content: Joi.string().min(1).max(1000).required(),
  tags: Joi.array().items(Joi.string()).default([]),
  type: Joi.string().valid(...entryTypes).required()
});

const noteSchema = Joi.object({
  rep_id: Joi.string()
    .pattern(/^[a-z0-9_]+$/)
    .required()
    .messages({
      'string.pattern.base': 'rep_id must be lowercase alphanumeric with underscores'
    }),
  exercise_ids: Joi.array().items(Joi.string()).default([]),
  
  // Custom validation for ISO date with time
  timestamp: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/)
    .required()
    .messages({
      'string.pattern.base': '"timestamp" must be in ISO 8601 date format'
    }),
  
  duration: Joi.number().integer().min(1).max(480).required(),
  
  raw_content: Joi.string().min(1).max(10000).required(),
  
  entries: Joi.array().items(entrySchema).min(1).required()
});

export function validateNote(data) {
  const { error, value } = noteSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: false  // This prevents type coercion
  });
  
  if (error) {
    return {
      valid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    };
  }
  
  return { valid: true, value };
}
