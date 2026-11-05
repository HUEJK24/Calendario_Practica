jest.mock('../src/config/database');

const bcrypt = require('bcrypt');
const db = require('../src/config/database');
const User = require('../src/models/user.model');

describe('User', () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  describe('normalizeEmail', () => {
    test('quita espacios y pasa a minúsculas', () => {
      expect(User.normalizeEmail('  QA+1@Example.COM ')).toBe('qa+1@example.com');
    });
  });

  describe('hashPassword', () => {
    test('devuelve un hash distinto de la contraseña plana', async () => {
      const hash = await User.hashPassword('QaPassword123!');
      expect(hash).not.toBe('QaPassword123!');
      expect(hash.startsWith('$2')).toBe(true);
      await expect(bcrypt.compare('QaPassword123!', hash)).resolves.toBe(true);
    });
  });

  describe('create', () => {
    test('normaliza el correo, cifra la clave y no expone el hash', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 7,
            email: 'qa+7@example.com',
            created_at: new Date('2026-01-01T00:00:00Z'),
            updated_at: new Date('2026-01-01T00:00:00Z'),
          },
        ],
      });

      const user = await User.create({
        email: '  QA+7@Example.com ',
        password: 'QaPassword123!',
      });

      expect(db.query).toHaveBeenCalledTimes(1);
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('INSERT INTO users');
      expect(params[0]).toBe('qa+7@example.com');
      expect(params[1]).not.toBe('QaPassword123!');
      expect(user.id).toBe(7);
      expect(user.toJSON()).not.toHaveProperty('password');
    });
  });

  describe('findByEmail', () => {
    test('devuelve null cuando no existe', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(User.findByEmail('nadie@example.com')).resolves.toBeNull();
    });

    test('busca con el correo normalizado', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'qa@example.com', password: 'hash' }],
      });

      const user = await User.findByEmail('  QA@Example.com ');

      expect(db.query.mock.calls[0][1]).toEqual(['qa@example.com']);
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('qa@example.com');
    });
  });

  describe('findById', () => {
    test('devuelve el usuario sin el campo password', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 3, email: 'qa+3@example.com', created_at: new Date(), updated_at: new Date() }],
      });

      const user = await User.findById(3);

      expect(user.id).toBe(3);
      expect(user.toJSON()).toEqual({
        id: 3,
        email: 'qa+3@example.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    test('devuelve null cuando no existe', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(User.findById(99)).resolves.toBeNull();
    });
  });

  describe('verifyPassword', () => {
    test('acepta la contraseña correcta y rechaza la incorrecta', async () => {
      const hash = await bcrypt.hash('QaPassword123!', 4);
      const user = new User({ id: 1, email: 'qa@example.com', password: hash });

      await expect(user.verifyPassword('QaPassword123!')).resolves.toBe(true);
      await expect(user.verifyPassword('OtraClave123!')).resolves.toBe(false);
    });
  });
});
