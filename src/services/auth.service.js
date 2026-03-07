import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already in use");
  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });
  const token = signToken({ id: user._id });
  return { user, token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const ok = await comparePassword(password, user.password);
  if (!ok) throw new Error("Invalid credentials");
  const token = signToken({ id: user._id });
  return { user, token };
}

function findById(id) {
  return User.findById(id);
}

export default { register, login, findById };
