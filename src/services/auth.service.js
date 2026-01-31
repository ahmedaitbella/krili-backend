const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('Email already in use');
  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });
  const token = signToken({ id: user._id });
  return { user, token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');
  const ok = await comparePassword(password, user.password);
  if (!ok) throw new Error('Invalid credentials');
  const token = signToken({ id: user._id });
  return { user, token };
}

function findById(id) {
  return User.findById(id);
}

module.exports = { register, login, findById };
