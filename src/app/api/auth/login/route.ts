/**
 * Login API Route
 *
 * Forward login request ke backend API eksternal.
 *
 * Keamanan:
 * 1. Input validation dengan Zod
 * 2. Rate limiting per IP
 * 3. CSRF protection
 * 4. JWT token di httpOnly cookie
 *
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from "next/server";

import {
  createAccessToken,
  createRefreshToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  type AuthUser,
} from "@/lib/auth";
import { loginSchema, validateForm } from "@/lib/validations";

// Rate limit store (per server instance)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 60_000; // 1 menit

/** Bersihkan entry expired untuk mencegah memory leak */
function cleanupLoginAttempts() {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (now > entry.resetTime) {
      loginAttempts.delete(key);
    }
  }
}

// Cleanup setiap 5 menit (anti memory leak)
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL = 5 * 60_000;
  const existing = (globalThis as Record<string, unknown>).__loginRateLimitCleanup as ReturnType<typeof setInterval> | undefined;
  if (!existing) {
    (globalThis as Record<string, unknown>).__loginRateLimitCleanup = setInterval(
      cleanupLoginAttempts,
      CLEANUP_INTERVAL
    );
  }
}

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + LOGIN_WINDOW_MS });
    return true;
  }

  entry.count++;
  return entry.count <= MAX_LOGIN_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (!checkLoginRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    // 2. Verifikasi CSRF token (double-submit cookie pattern)
    // Client mengirim token di header DAN cookie.
    // Server memverifikasi keduanya cocok.
    const csrfTokenHeader = request.headers.get("x-csrf-token");
    const csrfTokenCookie = request.cookies.get("csrf-token")?.value;

    if (
      !csrfTokenHeader ||
      !csrfTokenCookie ||
      csrfTokenHeader.length < 10 ||
      csrfTokenHeader !== csrfTokenCookie
    ) {
      return NextResponse.json(
        { error: "Request tidak valid. Silakan muat ulang halaman." },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Request body tidak valid." },
        { status: 400 }
      );
    }

    // 4. Validasi & sanitisasi input dengan Zod
    const validation = validateForm(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", details: validation.errors },
        { status: 400 }
      );
    }

    const sanitizedData = validation.data as { email: string; nip: string; password: string };
    const { email, nip, password } = sanitizedData;

    // 5. Autentikasi ke backend API eksternal
    const BACKEND_AUTH_URL = process.env.API_URL
      ? `${process.env.API_URL}/authentications`
      : "http://localhost:8000/api/v1/authentications";

    let backendRes: Response;
    try {
      backendRes = await fetch(BACKEND_AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ email, nip, password }),
        signal: AbortSignal.timeout(15_000), // 15 detik timeout
      });
    } catch {
      return NextResponse.json(
        { error: "Tidak dapat terhubung ke server autentikasi." },
        { status: 502 }
      );
    }

    const backendData = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      const errorMsg = backendData?.message
        ?? backendData?.error
        ?? "Email, NIP, atau password salah.";
      return NextResponse.json(
        { error: errorMsg },
        { status: backendRes.status }
      );
    }

    // 6. Ambil data user dari response backend
    // Sesuaikan mapping dari response backend ke AuthUser
    const backendUser = backendData?.data?.user ?? backendData?.user ?? backendData?.data ?? {};
    const authenticatedUser: AuthUser = {
      id: backendUser.id ?? "usr_001",
      email: email,
      nip: nip,
      role: backendUser.role ?? "user",
      name: backendUser.name ?? backendUser.full_name ?? "Admin PKP",
    };

    // 6. Generate JWT tokens
    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(authenticatedUser),
      createRefreshToken(authenticatedUser),
    ]);

    // 7. Set tokens di httpOnly cookies (BUKAN di response body!)
    const response = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
      },
      // JANGAN kirim token di response body!
      // Token dikirim via httpOnly cookie yang tidak bisa diakses JavaScript
    });

    // Set access token cookie
    const accessOpts = getAccessTokenCookieOptions();
    response.cookies.set(accessOpts.name, accessToken, {
      httpOnly: accessOpts.httpOnly,
      secure: accessOpts.secure,
      sameSite: accessOpts.sameSite,
      path: accessOpts.path,
      maxAge: accessOpts.maxAge,
    });

    // Set refresh token cookie
    const refreshOpts = getRefreshTokenCookieOptions();
    response.cookies.set(refreshOpts.name, refreshToken, {
      httpOnly: refreshOpts.httpOnly,
      secure: refreshOpts.secure,
      sameSite: refreshOpts.sameSite,
      path: refreshOpts.path,
      maxAge: refreshOpts.maxAge,
    });

    return response;
  } catch {
    // JANGAN ekspos detail error ke client di production
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
