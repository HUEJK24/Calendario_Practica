/**
 * Sprint 3 — Patrón Strategy (interfaz de la familia de algoritmos).
 *
 * Define el contrato que debe cumplir cualquier formato de exportación:
 * `export(events)` devuelve el contenido serializado y `contentType`/
 * `fileExtension` describen cómo debe devolverlo la capa HTTP.
 *
 * El cliente (export.controller.js) depende SOLO de esta interfaz, nunca de un
 * formato concreto. Para agregar un formato nuevo basta con implementar esta
 * clase y registrarlo en exporter.js: el resto del código no cambia.
 */
class ExportStrategy {
  get contentType() {
    throw new Error('contentType debe ser implementado por la estrategia concreta.');
  }

  get fileExtension() {
    throw new Error('fileExtension debe ser implementado por la estrategia concreta.');
  }

  export(events) {
    throw new Error('export(events) debe ser implementado por la estrategia concreta.');
  }
}

module.exports = ExportStrategy;
