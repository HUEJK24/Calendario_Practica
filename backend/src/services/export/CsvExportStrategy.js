const ExportStrategy = require('./ExportStrategy');

const COLUMNS = ['id', 'title', 'description', 'date', 'startTime', 'endTime', 'category', 'priority'];

/**
 * Sprint 3 — Estrategia concreta: exportación en CSV (RFC 4180).
 *
 * `escape` resuelve los tres casos que rompen un CSV: separador (coma),
 * comillas dobles y salto de línea dentro de un campo. Cualquier valor que
 * empiece con =, +, - o @ se antepone con comilla simple para neutralizar la
 * inyección de fórmulas (CSV injection) al abrir el archivo en una hoja de
 * cálculo.
 */
class CsvExportStrategy extends ExportStrategy {
  get contentType() {
    return 'text/csv; charset=utf-8';
  }

  get fileExtension() {
    return 'csv';
  }

  escape(value) {
    const text = value === null || value === undefined ? '' : String(value);
    const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return /[",\n\r]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
  }

  export(events) {
    const header = COLUMNS.map((column) => this.escape(column)).join(',');
    const rows = events.map((event) =>
      COLUMNS.map((column) => this.escape(event[column])).join(',')
    );
    return [header, ...rows].join('\r\n');
  }
}

module.exports = CsvExportStrategy;
