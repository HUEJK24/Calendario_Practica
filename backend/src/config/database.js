const { Pool } = require('pg');
const env = require('./env');

/**
 * Patrón Singleton: garantiza una única instancia del Pool de conexiones
 * durante todo el ciclo de vida del servidor.
 */
class DatabaseConnection {
  constructor() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = this;
      this.pool = null;
    }
    return DatabaseConnection.instance;
  }

  async connect() {
    if (!this.pool) {
      this.pool = new Pool({
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.database,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      this.pool.on('error', (error) => {
        console.error('Error inesperado en el pool de PostgreSQL:', error.message);
      });
    }

    const client = await this.pool.connect();
    client.release();
    return this.pool;
  }

  getPool() {
    if (!this.pool) {
      throw new Error('La base de datos no está inicializada. Llama a connect() primero.');
    }
    return this.pool;
  }

  query(text, params) {
    return this.getPool().query(text, params);
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

module.exports = new DatabaseConnection();
