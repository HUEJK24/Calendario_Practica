const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'calendario',
    password: process.env.DB_PASSWORD || 'calendario',
    database: process.env.DB_NAME || 'calendario',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-no-usar-en-produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
};

if (env.nodeEnv === 'production') {
  required('JWT_SECRET');
  if (env.jwt.secret === 'dev-secret-no-usar-en-produccion') {
    throw new Error('JWT_SECRET debe definirse en producción con un valor robusto.');
  }
}

module.exports = env;
