import crypto from "crypto";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";

/** Hash a refresh token before storing it in the database. */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

async function register(data) {
  const { email, password } = data;
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already in use");
  const hashed = await hashPassword(password);
  const user = await User.create({ ...data, password: hashed });

  const token = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return { user, token, refreshToken };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  if (!user.password)
    throw new Error(
      "This account uses Google sign-in. Please log in with Google.",
    );
  const ok = await comparePassword(password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  const token = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return { user, token, refreshToken };
}

function findById(id) {
  return User.findById(id);
}

export { hashToken };
export default { register, login, findById };
