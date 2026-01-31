const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const signToken = (payload, options = { expiresIn: '7d' }) => {
  return jwt.sign(payload, jwtSecret, options);
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = { signToken, verifyToken };
