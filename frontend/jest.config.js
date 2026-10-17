/**
 * Sprint 4 — Configuración de pruebas unitarias del frontend (Jest + jest-expo).
 *
 * El preset `jest-expo` ya trae el entorno de React Native y el preset de Babel
 * (`expo/internal/babel-preset`), por lo que no hace falta un `babel.config.js`.
 *
 * Las pruebas de lógica pura (por ejemplo `domain/utils/date.js`) van en
 * `tests/<nombre>.test.js` y se ejecutan con `npm test`.
 */
module.exports = {
  preset: 'jest-expo',
  clearMocks: true,
};
