const { z } = require('zod');

const exportQuerySchema = z
  .object({
    format: z.enum(['json', 'csv']).default('json'),
  })
  .strict();

module.exports = { exportQuerySchema };
