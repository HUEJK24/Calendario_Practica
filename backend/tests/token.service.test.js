const jwt = require('jsonwebtoken');
const env = require('../src/config/env');
const tokenService = require('../src/services/token.service');

describe('token.service', () => {
  const user = { id: 42, email: 'qa+42@example.com' };

  test('firma un token con el id y el correo del usuario', () => {
    const token = tokenService.sign(user);
    const payload = tokenService.verify(token);

    expect(payload.sub).toBe(42);
    expect(payload.email).toBe('qa+42@example.com');
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  test('rechaza un token alterado', () => {
    const token = tokenService.sign(user);
    const [header, payload, signature] = token.split('.');
    const altered = `${header}.${payload}.${signature[0] === 'a' ? 'b' : 'a'}${signature.slice(1)}`;

    expect(() => tokenService.verify(altered)).toThrow();
  });

  test('rechaza un token firmado con otro secreto', () => {
    const foreign = jwt.sign({ sub: 1, email: 'otro@example.com' }, 'secreto-distinto');

    expect(() => tokenService.verify(foreign)).toThrow();
  });

  test('rechaza un token vencido', () => {
    const expired = jwt.sign({ sub: 1, email: 'qa@example.com' }, env.jwt.secret, {
      expiresIn: -1,
    });

    expect(() => tokenService.verify(expired)).toThrow(jwt.TokenExpiredError);
  });
});
