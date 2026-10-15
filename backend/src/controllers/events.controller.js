const Event = require('../models/event.model');
const {
  createEventSchema,
  updateEventSchema,
  idParamSchema,
  formatIssues,
} = require('../validators/event.schema');

function validate(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return { error: formatIssues(result.error) };
  }
  return { data: result.data };
}

async function list(req, res) {
  const events = await Event.findAllByUser(req.user.sub);
  return res.json({ events: events.map((event) => event.toJSON()) });
}

async function getOne(req, res) {
  const id = idParamSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ message: 'Identificador inválido.' });
  }

  const event = await Event.findByIdForUser(id.data, req.user.sub);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado.' });
  }
  return res.json({ event: event.toJSON() });
}

async function create(req, res) {
  const { data, error } = validate(createEventSchema, req.body || {});
  if (error) {
    return res.status(400).json({ message: 'Datos inválidos.', errors: error });
  }

  const event = await Event.create(req.user.sub, data);
  return res.status(201).json({ event: event.toJSON() });
}

async function update(req, res) {
  const id = idParamSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ message: 'Identificador inválido.' });
  }

  const { data, error } = validate(updateEventSchema, req.body || {});
  if (error) {
    return res.status(400).json({ message: 'Datos inválidos.', errors: error });
  }

  const event = await Event.update(id.data, req.user.sub, data);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado.' });
  }
  return res.json({ event: event.toJSON() });
}

async function remove(req, res) {
  const id = idParamSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ message: 'Identificador inválido.' });
  }

  const deleted = await Event.delete(id.data, req.user.sub);
  if (!deleted) {
    return res.status(404).json({ message: 'Evento no encontrado.' });
  }
  return res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };
