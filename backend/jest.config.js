/**
 * Sprint 4 — Configuración de pruebas unitarias del backend (Jest).
 *
 * Entorno Node (no requiere navegador). `clearMocks` reinicia los mocks entre
 * pruebas para que ninguna dependencia simulada arrastre estado.
 *
 * Para agregar una prueba basta con crear `tests/<nombre>.test.js` y, si toca
 * base de datos, iniciar el archivo con:
 *
 *   jest.mock('../src/config/database');
 *
 * Eso sustituye el Singleton por `src/config/__mocks__/database.js`, de modo
 * que la suite corre sin PostgreSQL levantado.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/**/__mocks__/**'],
};
