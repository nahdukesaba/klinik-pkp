/** Security Utilities — sanitization, escaping, rate limiting, CSRF, password strength. */

// --- 1. Input Sanitization ---

// Hoist RegExp ke module-level
const RE_HTML_TAGS = /<[^>]*>/g;
const RE_EVENT_HANDLERS = /on\w+\s*=/gi;
const RE_JAVASCRIPT_PROTO = /javascript:/gi;
const RE_DATA_PROTO = /data:/gi;
const RE_VBSCRIPT_PROTO = /vbscript:/gi;
const RE_EMAIL_CHARS = /[^a-zA-Z0-9@._+\-]/g;
const RE_NIP_CHARS = /[^0-9\s]/g;
const RE_HTML_ESCAPE = /[&<>"'/`]/g;

/**
 * Sanitasi input umum — hapus tag HTML, event handler, dan protocol berbahaya.
 * Dipakai di semua search input sebelum diproses.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    .replace(RE_HTML_TAGS, "")
    .replace(RE_EVENT_HANDLERS, "")
    .replace(RE_JAVASCRIPT_PROTO, "")
    .replace(RE_DATA_PROTO, "")
    .replace(RE_VBSCRIPT_PROTO, "")
    .trim();
}

/** Sanitize email — hanya izinkan karakter email yang valid. */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(RE_EMAIL_CHARS, "").trim();
}

/** Sanitize NIP — hanya izinkan angka dan spasi. */
export function sanitizeNip(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(RE_NIP_CHARS, "").trim();
}

// --- 2. HTML Sanitization ---

/** Escape HTML entities untuk mencegah XSS di popup Leaflet dll. */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";

  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#96;",
  };

  return str.replace(RE_HTML_ESCAPE, (char) => htmlEscapeMap[char] ?? char);
}

/** Escape value untuk HTML attribute (lebih strict dari escapeHtml). */
export function escapeAttr(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Sanitize URL — hanya izinkan http:, https:, dan relative path. */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();

  // Izinkan relative paths
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  // Izinkan http dan https saja
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }

  // Blokir semua protocol lainnya
  return "";
}

// --- 3. Rate Limiting (Client-side) ---

/** Simple client-side rate limiter menggunakan Map. */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000 // 1 menit
): { allowed: boolean; remainingAttempts: number; resetInMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remainingAttempts: maxAttempts - 1, resetInMs: windowMs };
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetInMs: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - entry.count,
    resetInMs: entry.resetTime - now,
  };
}

// --- 4. CSRF Token ---

/** Generate CSRF token (double-submit cookie pattern). */
export function generateCsrfToken(): string {
  if (typeof window === "undefined") return "";

  const token = crypto.randomUUID();

  // Set cookie SameSite=Strict agar tidak dikirim cross-origin
  document.cookie = `csrf-token=${token}; path=/; SameSite=Strict; max-age=600`;

  return token;
}

// --- 5. Password Strength ---

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  suggestions: string[];
}

/** Evaluasi kekuatan password (score 0-4). */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else suggestions.push("Minimal 8 karakter");

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  else suggestions.push("Gunakan huruf besar dan kecil");

  if (/\d/.test(password)) score++;
  else suggestions.push("Tambahkan angka");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else suggestions.push("Tambahkan karakter spesial");

  const labels = ["Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    suggestions,
  };
}
