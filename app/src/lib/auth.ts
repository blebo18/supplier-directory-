import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";

const SALT_ROUNDS = 10;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecret());
}

export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
}

export function requireRole(user: JWTPayload | null, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
