const JsonExportStrategy = require('./JsonExportStrategy');
const CsvExportStrategy = require('./CsvExportStrategy');

/**
 * Sprint 3 — Contexto del patrón Strategy.
 *
 * Guarda el registro de estrategias disponibles y resuelve cuál aplicar a
 * partir del formato pedido por el cliente. El resto de la aplicación no
 * conoce las clases concretas: solo llama a `resolve(formato).export(...)`.
 */
const strategies = new Map([
  ['json', new JsonExportStrategy()],
  ['csv', new CsvExportStrategy()],
]);

function resolve(format) {
  const strategy = strategies.get(format);
  if (!strategy) {
    throw new Error(`Formato de exportación no soportado: ${format}`);
  }
  return strategy;
}

function supportedFormats() {
  return [...strategies.keys()];
}

module.exports = { resolve, supportedFormats };
