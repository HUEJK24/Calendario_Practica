/**
 * Punto de composición de la API. Arquitectura por capas (Sprint 1):
 * petición → routes → (middleware de autenticación) → controllers →
 * validators (Zod) → models (SQL parametrizado). Aquí se montan los routers
 * de `/api/auth` y `/api/events` sobre Express, y la conexión a PostgreSQL se
 * resuelve con el patrón Singleton de `config/database.js`, de modo que toda
 * la aplicación comparte un único Pool de conexiones.
 */
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const eventsRoutes = require('./routes/events.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
