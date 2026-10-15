const jwt = require('jsonwebtoken');
const env = require('../config/env');

function sign(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

function verify(token) {
  return jwt.verify(token, env.jwt.secret);
}

module.exports = { sign, verify };
