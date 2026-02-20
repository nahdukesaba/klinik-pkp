/**
 * Login API Route
 *
 * Contoh implementasi login endpoint yang aman.
 *
 * Keamanan yang diterapkan:
 * 1. Input validation dengan Zod (anti SQL injection)
 * 2. Rate limiting per IP
 * 3. JWT token di httpOnly cookie (bukan localStorage!)
 * 4. Tidak mengekspos detail error ke client
 * 5. CSRF protection via SameSite cookie
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

    // 5. Autentikasi ke backend/database
    //
    // IMPLEMENTASI PRODUCTION:
    // Ganti blok di bawah dengan query ke database Anda.
    // Gunakan PARAMETERIZED QUERIES dan bcrypt.compare().
    //
    // Contoh:
    //   const user = await db.query(
    //     "SELECT * FROM users WHERE email = $1 AND nip = $2",
    //     [email, nip]
    //   );
    //   if (!user) return NextResponse.json({ error: "Kredensial salah." }, { status: 401 });
    //   const passwordValid = await bcrypt.compare(password, user.password_hash);
    //   if (!passwordValid) return NextResponse.json({ error: "Kredensial salah." }, { status: 401 });

    // --- Demo mode: validasi sederhana ---
    // Hapus blok ini dan ganti dengan database query saat production.
    //
    // KEAMANAN: Credentials HARUS di set via environment variables.
    // TIDAK ada fallback hardcoded — jika env var kosong, login selalu gagal.
    const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? "";
    const DEMO_NIP = process.env.DEMO_USER_NIP ?? "";
    const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "";

    // Jika env vars belum dikonfigurasi, tolak semua login
    if (!DEMO_EMAIL || !DEMO_NIP || !DEMO_PASSWORD) {
      console.error(
        "[AUTH] DEMO_USER_EMAIL, DEMO_USER_NIP, dan DEMO_USER_PASSWORD " +
        "harus di-set di environment variables."
      );
      return NextResponse.json(
        { error: "Sistem autentikasi belum dikonfigurasi." },
        { status: 503 }
      );
    }

    if (email !== DEMO_EMAIL || nip !== DEMO_NIP || password !== DEMO_PASSWORD) {
      // Jangan beri tahu field mana yang salah (anti-enumeration)
      return NextResponse.json(
        { error: "Email, NIP, atau password salah." },
        { status: 401 }
      );
    }

    const authenticatedUser: AuthUser = {
      id: "usr_001",
      email: email,
      nip: nip,
      role: "user",
      name: "Admin PKP",
    };
    // --- Akhir demo mode ---

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
