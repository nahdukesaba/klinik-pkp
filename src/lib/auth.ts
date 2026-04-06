/** JWT Token & Authentication (Server-side) — httpOnly cookies, jose library. */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// --- Konfigurasi ---

/** JWT Secret harus di-set di .env.local, minimal 32 karakter. */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set. " +
        "Please set it in .env.local with a minimum of 32 characters."
    );
  }
  if (secret.length < 32) {
    throw new Error(
      "JWT_SECRET terlalu pendek. Minimal 32 karakter untuk keamanan yang memadai. " +
        "Gunakan: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    );
  }
  return new TextEncoder().encode(secret);
}

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 menit
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 hari

// Cookie names
export const AUTH_COOKIE_NAME = "klinik-pkp-token";
export const REFRESH_COOKIE_NAME = "klinik-pkp-refresh";

// --- Tipe Token ---

export type AuthRole = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  nip: string;
  role: AuthRole;
  name: string;
  backendAccessToken?: string;
  backendRefreshToken?: string;
}

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  nip: string;
  role: AuthRole;
  name: string;
  type: "access" | "refresh";
  backendAccessToken?: string;
  backendRefreshToken?: string;
}

// --- Operasi JWT ---

function buildTokenPayload(
  user: AuthUser,
  type: TokenPayload["type"]
): TokenPayload {
  return {
    userId: user.id,
    email: user.email,
    nip: user.nip,
    role: user.role,
    name: user.name,
    type,
    ...(type === "access" && user.backendAccessToken
      ? { backendAccessToken: user.backendAccessToken }
      : {}),
    ...(type === "refresh" && user.backendRefreshToken
      ? { backendRefreshToken: user.backendRefreshToken }
      : {}),
  };
}

/** Buat JWT access token (15 menit). */
export async function createAccessToken(user: AuthUser): Promise<string> {
  const secret = getJwtSecret();

  return new SignJWT(buildTokenPayload(user, "access"))
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer("klinik-pkp")
    .setAudience("klinik-pkp-web")
    .sign(secret);
}

/** Buat JWT refresh token (7 hari). */
export async function createRefreshToken(user: AuthUser): Promise<string> {
  const secret = getJwtSecret();

  return new SignJWT(buildTokenPayload(user, "refresh"))
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer("klinik-pkp")
    .setAudience("klinik-pkp-web")
    .sign(secret);
}

/** Verify dan decode JWT token. Null jika invalid/expired. */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecret();

    const { payload } = await jwtVerify(token, secret, {
      issuer: "klinik-pkp",
      audience: "klinik-pkp-web",
    });

    return payload as TokenPayload;
  } catch {
    // Token invalid, expired, atau tampered
    return null;
  }
}

// --- Konfigurasi Cookie ---

/** Cookie options untuk access token (httpOnly, secure, sameSite:lax). */
export function getAccessTokenCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 15 * 60, // 15 menit dalam detik
  };
}

/** Cookie options untuk refresh token (hanya di path /api/auth). */
export function getRefreshTokenCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name: REFRESH_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60, // 7 hari dalam detik
  };
}
