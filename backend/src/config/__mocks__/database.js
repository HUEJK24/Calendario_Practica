/**
 * Sprint 4 — Mock del Singleton de base de datos (infraestructura de pruebas).
 *
 * Jest lo usa automáticamente cuando una prueba ejecuta
 * `jest.mock('../../src/config/database')`. Devuelve la misma forma que el
 * Singleton real (`query`, `connect`, `getPool`, `close`) pero con funciones
 * simuladas, así las pruebas corren sin un PostgreSQL real.
 *
 * Uso típico dentro de una prueba:
 *
 *   const db = require('../../src/config/database');
 *   db.query.mockResolvedValueOnce({ rows: [] });
 */
const query = jest.fn();

const databaseMock = {
  query,
  connect: jest.fn(async () => databaseMock),
  getPool: jest.fn(() => ({})),
  close: jest.fn(async () => {}),
};

module.exports = databaseMock;
