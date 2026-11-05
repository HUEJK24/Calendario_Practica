jest.mock('../src/config/database');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const db = require('../src/config/database');
const tokenService = require('../src/services/token.service');

const PASSWORD = 'QaPassword123!';
const row = {
  id: 1,
  email: 'qa+1@example.com',
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
};

describe('auth.controller', () => {
  let passwordHash;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(PASSWORD, 4);
  });

  beforeEach(() => {
    db.query.mockReset();
  });

  describe('POST /api/auth/register', () => {
    test('crea el usuario, devuelve token y no expone la contraseña', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [row] });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'QA+1@Example.com', password: PASSWORD });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('qa+1@example.com');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.token).toBeTruthy();
      expect(tokenService.verify(res.body.token).sub).toBe(1);
      expect(db.query.mock.calls[1][1][0]).toBe('qa+1@example.com');
      expect(db.query.mock.calls[1][1][1]).not.toBe(PASSWORD);
    });

    test('responde 409 si el correo ya existe', async () => {
      db.query.mockResolvedValueOnce({ rows: [row] });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: row.email, password: PASSWORD });

      expect(res.status).toBe(409);
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    test('responde 400 con correo inválido y clave corta sin tocar la base', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'no-es-correo', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveLength(2);
      expect(db.query).not.toHaveBeenCalled();
    });

    test('responde 400 si falta el cuerpo', async () => {
      const res = await request(app).post('/api/auth/register').send({});

      expect(res.status).toBe(400);
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    test('responde 200 con token cuando las credenciales son correctas', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ ...row, password: passwordHash }] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: row.email, password: PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user).not.toHaveProperty('password');
    });

    test('responde 401 con la contraseña incorrecta', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ ...row, password: passwordHash }] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: row.email, password: 'OtraClave123!' });

      expect(res.status).toBe(401);
    });

    test('responde 401 si el usuario no existe', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nadie@example.com', password: PASSWORD });

      expect(res.status).toBe(401);
    });

    test('responde 400 si falta correo o contraseña', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: row.email });

      expect(res.status).toBe(400);
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/me', () => {
    test('responde 401 sin token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(db.query).not.toHaveBeenCalled();
    });

    test('responde 401 con un token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido');

      expect(res.status).toBe(401);
    });

    test('responde 200 con el usuario del token', async () => {
      const token = tokenService.sign({ id: row.id, email: row.email });
      db.query.mockResolvedValueOnce({ rows: [row] });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(row.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    test('responde 404 si el usuario del token ya no existe', async () => {
      const token = tokenService.sign({ id: 99, email: 'borrado@example.com' });
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
