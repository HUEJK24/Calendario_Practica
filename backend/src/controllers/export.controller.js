const Event = require('../models/event.model');
const exporter = require('../services/export/exporter');
const { exportQuerySchema } = require('../validators/export.schema');

/**
 * Sprint 3 — Exportación de eventos mediante el patrón Strategy.
 *
 * El controlador no sabe cómo se serializa: resuelve la estrategia a partir
 * del parámetro `format` y le delega la serialización. El propietario sale de
 * `req.user.sub` (token JWT), por lo que la exportación nunca puede filtrar
 * eventos de otro usuario.
 */
async function exportEvents(req, res) {
  const parsed = exportQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Formato de exportación no soportado.',
      errors: [{ field: 'format', message: 'Use json o csv.' }],
    });
  }

  const strategy = exporter.resolve(parsed.data.format);
  const events = await Event.findAllByUser(req.user.sub);
  const content = strategy.export(events.map((event) => event.toJSON()));

  res.setHeader('Content-Type', strategy.contentType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="eventos.${strategy.fileExtension}"`
  );
  return res.send(content);
}

module.exports = { exportEvents };
