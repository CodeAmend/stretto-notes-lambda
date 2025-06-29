import Joi from 'joi';

// Enum values
const importanceValues = ['active', 'backburner', 'reference', 'archived'];
const statusValues = ['learning', 'polishing', 'performance_ready', 'paused'];
const memorizedValues = ['none', 'shaky', 'confident', 'solid'];

// Metadata schema
const metadataSchema = Joi.object({
  composer: Joi.string().allow('').optional(),
  opus_info: Joi.string().allow('').optional(),
  keys: Joi.array().items(Joi.string()).default([]),
  year_composed: Joi.number().integer().min(1000).max(2100).optional(),
  difficulty: Joi.string().optional()
}).default({});

// Main repertoire schema
const repertoireSchema = Joi.object({
  // Required fields
  rep_id: Joi.string()
    .pattern(/^[a-z0-9_]+$/)
    .required()
    .messages({
      'string.pattern.base': 'rep_id must be lowercase alphanumeric with underscores'
    }),
    
  name: Joi.string().min(1).max(200).required(),
  display_name: Joi.string().min(1).max(100).required(),
  
  // Enums with defaults
  importance: Joi.string()
    .valid(...importanceValues)
    .default('active'),
    
  status: Joi.string()
    .valid(...statusValues)
    .default('learning'),
    
  memorized: Joi.string()
    .valid(...memorizedValues)
    .default('none'),
  
  // Complex fields
  metadata: metadataSchema,
  
  // Arrays
  aliases: Joi.array().items(Joi.string()).default([]),
  tags: Joi.array().items(Joi.string()).default([]),
  
  // Dates
  target_date: Joi.date().iso().allow(null).optional(),
  started_date: Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/)
  .default(() => new Date().toISOString())
  .messages({
    'string.pattern.base': '"started_date" must be in ISO 8601 date format with time'
  }),
  
  // Note: last_practiced will be set by the system when notes reference this repertoire
  last_practiced: Joi.date().iso().optional()
});

/**
 * Validates repertoire data against the schema
 * @param {Object} data - The repertoire data to validate
 * @returns {Object} - { valid: boolean, value?: Object, errors?: Array }
 */
export function validateRepertoire(data) {
  const { error, value } = repertoireSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
    // Removed convert: false to allow date string to Date conversion
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

// Export for use in other validators or shared validation
export const repertoireValidationSchemas = {
  importanceValues,
  statusValues,
  memorizedValues,
  metadataSchema,
  repertoireSchema
};
