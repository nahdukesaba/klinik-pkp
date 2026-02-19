/**
 * JWT Token & Auth Utilities (Server-side)
 *
 * Handle JWT token secara AMAN menggunakan httpOnly cookies.
 * JANGAN PERNAH simpan token di localStorage/sessionStorage.
 *
 * Best Practices yang diterapkan:
 * 1. JWT disimpan di httpOnly cookie (tidak bisa diakses JavaScript)
 * 2. Cookie diset dengan Secure flag (HTTPS only)
 * 3. SameSite=Lax (anti-CSRF)
 * 4. Token memiliki expiration time
 * 5. Menggunakan `jose` library (compatible dengan Edge Runtime)
 *
 * @module auth
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ============================================
// Configuration
// ============================================

/**
 * PENTING: Di production, simpan JWT_SECRET di environment variable.
 * JANGAN PERNAH hardcode secret di source code.
 *
 * Contoh .env.local:
 * JWT_SECRET=your-super-secret-key-min-32-chars-long
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set. " +
        "Please set it in .env.local with a minimum of 32 characters."
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

// ============================================
// Token Types
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  nip: string;
  role: "admin" | "user";
  name: string;
}

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  nip: string;
  role: "admin" | "user";
  name: string;
  type: "access" | "refresh";
}

// ============================================
// JWT Operations
// ============================================

/**
 * Create JWT access token.
 * Short-lived (15 menit) — harus di-refresh secara berkala.
 */
export async function createAccessToken(user: AuthUser): Promise<string> {
  const secret = getJwtSecret();

  return new SignJWT({
    userId: user.id,
    email: user.email,
    nip: user.nip,
    role: user.role,
    name: user.name,
    type: "access",
  } as TokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer("klinik-pkp")
    .setAudience("klinik-pkp-web")
    .sign(secret);
}

/**
 * Create JWT refresh token.
 * Long-lived (7 hari) — digunakan untuk mendapatkan access token baru.
 */
export async function createRefreshToken(user: AuthUser): Promise<string> {
  const secret = getJwtSecret();

  return new SignJWT({
    userId: user.id,
    email: user.email,
    nip: user.nip,
    role: user.role,
    name: user.name,
    type: "refresh",
  } as TokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer("klinik-pkp")
    .setAudience("klinik-pkp-web")
    .sign(secret);
}

/**
 * Verify dan decode JWT token.
 * Mengembalikan null jika token invalid atau expired.
 */
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

// ============================================
// Cookie Configuration
// ============================================

/**
 * Generate cookie options yang aman untuk access token.
 * httpOnly: true — JavaScript TIDAK bisa akses cookie ini
 * secure: true — Hanya dikirim via HTTPS
 * sameSite: lax — Mencegah CSRF attacks
 * path: / — Berlaku untuk seluruh aplikasi
 */
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

/**
 * Generate cookie options untuk refresh token.
 * Disimpan di path /api/auth/refresh saja untuk keamanan tambahan.
 */
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
