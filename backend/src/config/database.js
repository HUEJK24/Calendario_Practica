const { Pool, types } = require('pg');
const env = require('./env');

/**
 * Evita desajustes de zona horaria: DATE y TIME se devuelven como texto
 * ('AAAA-MM-DD' y 'HH:MM') en lugar de objetos Date dependientes del locale.
 */
const DATE_OID = 1082;
const TIME_OID = 1083;
types.setTypeParser(DATE_OID, (value) => value);
types.setTypeParser(TIME_OID, (value) => (value ? value.slice(0, 5) : value));

/**
 * Patrón de diseño Singleton aplicado en este archivo: garantiza una única
 * instancia del Pool de conexiones durante todo el ciclo de vida del servidor.
 * El `module.exports` devuelve esa instancia compartida
 * (`new DatabaseConnection()`): el Pool se crea una sola vez en `connect()` y
 * se reutiliza en `query()`, por lo que toda la aplicación (models y servicios)
 * consulta a través de la misma conexión.
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
        ...(env.databaseUrl
          ? { connectionString: env.databaseUrl }
          : {
              host: env.db.host,
              port: env.db.port,
              user: env.db.user,
              password: env.db.password,
              database: env.db.database,
            }),
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
