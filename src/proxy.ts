/**
 * Next.js Proxy — CSP, security headers, route protection, rate limiting.
 * @see https://nextjs.org/docs/app/guides/content-security-policy
 */

import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

// --- Protected Routes Configuration ---

/** Routes yang membutuhkan authentication */
const PROTECTED_ROUTES = ["/dashboard", "/admin"];

/** Routes yang hanya bisa diakses oleh user yang BELUM login */
const AUTH_ROUTES = ["/login"];

// --- Rate Limiting Store (in-memory, per server instance) ---

const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

const RATE_LIMIT_MAX = 60; // max requests
const RATE_LIMIT_WINDOW = 60_000; // per 1 menit

// Hoist RegExp ke module-level.
// Ref: vercel-react-best-practices/js-hoist-regexp
const RE_WHITESPACE_COLLAPSE = /\s{2,}/g;

/**
 * Bersihkan entry rate limit yang sudah expired
 * untuk mencegah memory leak pada long-running server.
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Jalankan cleanup setiap 5 menit
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL = 5 * 60_000;
  const existing = (globalThis as Record<string, unknown>).__rateLimitCleanup as ReturnType<typeof setInterval> | undefined;
  if (!existing) {
    (globalThis as Record<string, unknown>).__rateLimitCleanup = setInterval(
      cleanupRateLimitStore,
      CLEANUP_INTERVAL
    );
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// --- Proxy Handler ---

/**
 * Daftar path API backend yang diizinkan.
 * Request ke path di luar daftar ini akan ditolak (403).
 * Tambahkan path baru di sini saat endpoint backend bertambah.
 */
const ALLOWED_API_PATHS = [
  "/api/ext/rusun",
  "/api/ext/uploads/",
  "/api/ext/sosialisasi",
  "/api/ext/bank-desain",
  "/api/ext/kumuh",
  "/api/ext/bsps",
  "/api/ext/authentications",
  "/api/ext/users",
  "/api/ext/regions",
  "/api/ext/districts",
  "/api/ext/villages",
];

/** Cek apakah path API diizinkan berdasarkan allowlist */
function isAllowedApiPath(pathname: string): boolean {
  return ALLOWED_API_PATHS.some(
    (allowed) => pathname === allowed || pathname.startsWith(allowed)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---- Rate Limiting (berlaku untuk SEMUA request termasuk /api/ext/) ----
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // ---- API Proxy: validasi path + tambah ngrok header ----
  // Request /api/ext/* di-rewrite ke backend oleh next.config.mjs.
  // Hanya path yang ada di ALLOWED_API_PATHS yang diizinkan.
  if (pathname.startsWith("/api/ext/")) {
    if (!isAllowedApiPath(pathname)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const headers = new Headers(request.headers);
    headers.set("ngrok-skip-browser-warning", "true");
    return NextResponse.next({ request: { headers } });
  }

  // ---- Generate Nonce for CSP ----
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // ---- Content Security Policy ----
  // CSP adalah pertahanan utama terhadap:
  // - XSS (Cross-Site Scripting)
  // - Third-party script injection
  // - Data exfiltration
  // - Clickjacking (via frame-ancestors)
  //
  // CATATAN: 'strict-dynamic' TIDAK digunakan karena akan men-disable 'self'
  // sehingga Next.js script chunks dari origin sendiri akan diblokir browser.
  // Nonce tetap digunakan untuk inline scripts (mis. next-themes).
  //
  // API calls melewati /api/ext rewrite (same-origin), jadi tidak perlu
  // whitelist domain external di connect-src.

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""} https://www.instagram.com https://*.cdninstagram.com https://*.facebook.com https://*.fbcdn.net;
    style-src 'self' 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://www.instagram.com https://*.cdninstagram.com;
    img-src 'self' blob: data: https: http:;
    font-src 'self' data: https://fonts.gstatic.com https://www.instagram.com https://*.cdninstagram.com;
    connect-src 'self'${isDev ? " ws: wss:" : ""} https://fonts.googleapis.com https://fonts.gstatic.com https://www.instagram.com https://*.cdninstagram.com https://*.facebook.com;
    media-src 'self' https://www.instagram.com https://*.cdninstagram.com https://*.fbcdn.net blob: data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://www.instagram.com;
    frame-src https://www.instagram.com https://www.facebook.com;
    child-src https://www.instagram.com https://www.facebook.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `;

  // Bersihkan whitespace berlebih
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(RE_WHITESPACE_COLLAPSE, " ")
    .trim();

  // ---- Set Request Headers ----
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  // ---- Route Protection ----
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Redirect ke login jika mengakses protected route tanpa token
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect ke dashboard jika sudah login tapi mengakses halaman login
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (authToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // ---- Build Response with Security Headers ----
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  // Anti-Clickjacking (defense-in-depth: CSP frame-ancestors + X-Frame-Options)
  response.headers.set("X-Frame-Options", "DENY");

  // Strict Transport Security (force HTTPS)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Cross-Origin Opener Policy — mencegah window access dari cross-origin
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  // Cross-Origin Resource Policy — mencegah resource loading dari origin lain
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Permissions Policy — batasi fitur browser yang bisa digunakan
  // CATATAN: Tidak memblokir 'unload' karena Next.js membutuhkannya untuk cleanup
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(), usb=()"
  );

  // Hapus header X-Powered-By (mencegah kebocoran informasi server)
  response.headers.delete("X-Powered-By");

  return response;
}

// --- Matcher Configuration ---

/**
 * Jalankan middleware di semua routes KECUALI:
 * - _next/static (static files)
 * - _next/image (image optimization)
 * - favicon.ico (favicon)
 * - Static image files (BUKAN /api/ext/ — itu harus lewat middleware)
 * - Prefetch requests
 */
export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon\\.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
