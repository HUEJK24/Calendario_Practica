const User = require('../models/user.model');
const tokenService = require('../services/token.service');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateCredentials({ email, password }) {
  const errors = [];
  if (!email || !EMAIL_REGEX.test(String(email))) {
    errors.push('El correo electrónico no es válido.');
  }
  if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }
  return errors;
}

async function register(req, res) {
  const { email, password } = req.body || {};

  const errors = validateCredentials({ email, password });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Datos inválidos.', errors });
  }

  const existing = await User.findByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'El correo ya está registrado.' });
  }

  const user = await User.create({ email, password });
  const token = tokenService.sign(user);

  return res.status(201).json({ user: user.toJSON(), token });
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
  }

  const user = await User.findByEmail(email);
  const passwordMatches = user ? await user.verifyPassword(password) : false;

  if (!user || !passwordMatches) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  const token = tokenService.sign(user);
  return res.json({ user: user.toJSON(), token });
}

async function me(req, res) {
  const user = await User.findById(req.user.sub);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }
  return res.json({ user: user.toJSON() });
}

module.exports = { register, login, me };
