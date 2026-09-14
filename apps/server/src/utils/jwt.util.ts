import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface TokenPayload {
  userId: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";


export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: TokenPayload): string {
 
  return jwt.sign(payload, REFRESH_SECRET,{ expiresIn: "7d" })
}


export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}


export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}