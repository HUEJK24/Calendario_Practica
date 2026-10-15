const bcrypt = require('bcrypt');
const db = require('../config/database');

const SALT_ROUNDS = 12;

class User {
  constructor({ id, email, password, created_at, updated_at }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  static normalizeEmail(email) {
    return String(email).trim().toLowerCase();
  }

  /**
   * Cifra la contraseña de forma asíncrona antes de persistirla.
   * Nunca se almacena texto plano.
   */
  static async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(plainPassword, salt);
  }

  static async create({ email, password }) {
    const normalizedEmail = User.normalizeEmail(email);
    const passwordHash = await User.hashPassword(password);

    const { rows } = await db.query(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)
       RETURNING id, email, created_at, updated_at`,
      [normalizedEmail, passwordHash]
    );

    return new User(rows[0]);
  }

  static async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [
      User.normalizeEmail(email),
    ]);
    return rows[0] ? new User(rows[0]) : null;
  }

  static async findById(id) {
    const { rows } = await db.query(
      'SELECT id, email, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] ? new User(rows[0]) : null;
  }

  verifyPassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = User;
