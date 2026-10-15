const { z } = require('zod');

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const CATEGORIES = ['work', 'personal', 'study', 'health', 'other'];
const PRIORITIES = ['high', 'medium', 'low'];

const baseEvent = {
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio.')
    .max(200, 'El título no puede exceder 200 caracteres.'),
  description: z
    .string()
    .trim()
    .max(1000, 'La descripción no puede exceder 1000 caracteres.')
    .optional()
    .default(''),
  date: z.string().regex(DATE_REGEX, 'La fecha debe tener formato AAAA-MM-DD.'),
  startTime: z.string().regex(TIME_REGEX, 'La hora de inicio debe tener formato HH:MM.'),
  endTime: z.string().regex(TIME_REGEX, 'La hora de fin debe tener formato HH:MM.'),
  category: z.enum(CATEGORIES, { message: 'Categoría no permitida.' }),
  priority: z.enum(PRIORITIES, { message: 'Prioridad no permitida.' }),
};

function withTimeOrder(schema) {
  return schema.refine((data) => data.startTime < data.endTime, {
    message: 'La hora de fin debe ser posterior a la hora de inicio.',
    path: ['endTime'],
  });
}

const createEventSchema = withTimeOrder(z.object(baseEvent).strict());

const updateEventSchema = withTimeOrder(
  z
    .object({
      title: baseEvent.title,
      description: baseEvent.description,
      date: baseEvent.date,
      startTime: baseEvent.startTime,
      endTime: baseEvent.endTime,
      category: baseEvent.category,
      priority: baseEvent.priority,
    })
    .strict()
);

const idParamSchema = z.coerce.number().int().positive('El identificador debe ser positivo.');

function formatIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

module.exports = { createEventSchema, updateEventSchema, idParamSchema, formatIssues };
