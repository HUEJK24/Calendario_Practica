const app = require('./app');
const env = require('./config/env');
const db = require('./config/database');

async function start() {
  try {
    await db.connect();
    console.log('Base de datos conectada exitosamente (instancia única / Singleton).');

    app.listen(env.port, () => {
      console.log(`Servidor escuchando en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
