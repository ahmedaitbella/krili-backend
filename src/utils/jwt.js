import jwt from "jsonwebtoken";
import { jwtSecret, jwtRefreshSecret } from "../config/env.js";

/** Legacy helper – kept for Google OAuth flow (7-day token). */
const signToken = (payload, options = { expiresIn: "7d" }) => {
  return jwt.sign(payload, jwtSecret, options);
};

/** Short-lived access token (15 minutes). */
const signAccessToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: "15m" });
};

/** Long-lived refresh token (7 days), signed with a separate secret. */
const signRefreshToken = (payload) => {
  return jwt.sign(payload, jwtRefreshSecret, { expiresIn: "7d" });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtRefreshSecret);
};

export {
  signToken,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
