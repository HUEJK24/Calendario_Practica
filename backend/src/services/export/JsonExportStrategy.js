const ExportStrategy = require('./ExportStrategy');

/**
 * Sprint 3 — Estrategia concreta: exportación en JSON.
 * Devuelve la lista de eventos serializada con sangría legible.
 */
class JsonExportStrategy extends ExportStrategy {
  get contentType() {
    return 'application/json; charset=utf-8';
  }

  get fileExtension() {
    return 'json';
  }

  export(events) {
    return JSON.stringify(events, null, 2);
  }
}

module.exports = JsonExportStrategy;
