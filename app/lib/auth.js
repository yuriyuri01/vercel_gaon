// lib/auth.js
import jwt from "jsonwebtoken";

export function signToken(payload, opts = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  const expiresIn = process.env.JWT_EXPIRES || "7d";
  return jwt.sign(payload, secret, { expiresIn, ...opts });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.verify(token, secret);
}
