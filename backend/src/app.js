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
