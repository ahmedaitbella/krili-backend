import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/env.js";

const signToken = (payload, options = { expiresIn: "7d" }) => {
  return jwt.sign(payload, jwtSecret, options);
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

export { signToken, verifyToken };
