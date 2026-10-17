/**
 * Sprint 3 — Manejo centralizado de errores sin fuga de información.
 *
 * El detalle real (incluido el stack trace y los mensajes de PostgreSQL) se
 * registra SOLO en el servidor. Hacia el cliente se envía el mensaje únicamente
 * cuando el error es intencional y de dominio (status < 500); ante un fallo
 * inesperado se responde un mensaje genérico para no revelar la estructura
 * interna de la aplicación.
 */
function notFound(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  const status = Number.isInteger(error.status) ? error.status : 500;
  const isOperational = status < 500;

  res.status(status).json({
    message: isOperational && error.message ? error.message : 'Error interno del servidor.',
  });
}

module.exports = { notFound, errorHandler };
