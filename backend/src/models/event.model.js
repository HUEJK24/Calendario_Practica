const db = require('../config/database');

const COLUMNS = `
  id, user_id, title, description,
  event_date, start_time, end_time,
  category, priority, created_at, updated_at
`;

/**
 * Acceso a datos de eventos.
 * Todo acceso está SIEMPRE acotado por user_id para prevenir IDOR:
 * el propietario nunca proviene del cliente, sino del token JWT.
 */
class Event {
  constructor(row) {
    this.id = row.id;
    this.userId = row.user_id;
    this.title = row.title;
    this.description = row.description;
    this.date = row.event_date;
    this.startTime = row.start_time;
    this.endTime = row.end_time;
    this.category = row.category;
    this.priority = row.priority;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static async findAllByUser(userId) {
    const { rows } = await db.query(
      `SELECT ${COLUMNS} FROM events
       WHERE user_id = $1
       ORDER BY event_date ASC, start_time ASC`,
      [userId]
    );
    return rows.map((row) => new Event(row));
  }

  static async findByIdForUser(id, userId) {
    const { rows } = await db.query(
      `SELECT ${COLUMNS} FROM events WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rows[0] ? new Event(rows[0]) : null;
  }

  static async create(userId, data) {
    const { rows } = await db.query(
      `INSERT INTO events
         (user_id, title, description, event_date, start_time, end_time, category, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${COLUMNS}`,
      [
        userId,
        data.title,
        data.description || '',
        data.date,
        data.startTime,
        data.endTime,
        data.category,
        data.priority,
      ]
    );
    return new Event(rows[0]);
  }

  static async update(id, userId, data) {
    const { rows } = await db.query(
      `UPDATE events SET
         title = $1, description = $2, event_date = $3,
         start_time = $4, end_time = $5, category = $6, priority = $7,
         updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING ${COLUMNS}`,
      [
        data.title,
        data.description || '',
        data.date,
        data.startTime,
        data.endTime,
        data.category,
        data.priority,
        id,
        userId,
      ]
    );
    return rows[0] ? new Event(rows[0]) : null;
  }

  static async delete(id, userId) {
    const { rowCount } = await db.query('DELETE FROM events WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);
    return rowCount > 0;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      category: this.category,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Event;
