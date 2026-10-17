/**
 * Punto de composición de la API. Arquitectura por capas (Sprint 1):
 * petición → routes → (middleware de autenticación) → controllers →
 * validators (Zod) → models (SQL parametrizado). Aquí se montan los routers
 * de `/api/auth`, `/api/events` y `/api/events/export` (Sprint 3) sobre
 * Express, y la conexión a PostgreSQL se resuelve con el patrón Singleton de
 * `config/database.js`, de modo que toda la aplicación comparte un único Pool
 * de conexiones.
 */
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const eventsRoutes = require('./routes/events.routes');
const exportRoutes = require('./routes/export.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

/**
 * Sprint 3 — Ruta de exportación (JSON / CSV) con el patrón Strategy.
 * Se registra ANTES de `/api/events` porque, de lo contrario, el
 * `GET /:id` del CRUD de eventos capturaría "export" como si fuera un
 * identificador y respondería 400 en lugar de exportar.
 */
app.use('/api/events/export', exportRoutes);
app.use('/api/events', eventsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
