/**
 * Security Utilities
 *
 * Modul keamanan komprehensif untuk aplikasi Klinik PKP.
 * Melindungi dari: SQL Injection, XSS, CSRF, dan input berbahaya lainnya.
 *
 * @module security
 */

// ============================================
// 1. Input Sanitization (Anti SQL Injection & XSS)
// ============================================

/**
 * Menghapus karakter berbahaya yang biasa digunakan dalam SQL injection.
 * PENTING: Ini adalah lapisan pertahanan tambahan di frontend.
 * Backend WAJIB menggunakan parameterized queries / prepared statements.
 *
 * @example
 * sanitizeInput("admin' OR 1=1 --") // "admin OR 11 "
 * sanitizeInput("Robert'); DROP TABLE users;--") // "Robert DROP TABLE users"
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return (
    input
      // Hapus SQL injection patterns
      .replace(/['";\\]/g, "")
      // Hapus SQL comment patterns
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "")
      // Hapus HTML/Script tags (anti-XSS)
      .replace(/<[^>]*>/g, "")
      // Hapus event handlers inline
      .replace(/on\w+\s*=/gi, "")
      // Hapus javascript: protocol
      .replace(/javascript:/gi, "")
      // Hapus data: protocol (anti-XSS)
      .replace(/data:/gi, "")
      // Hapus vbscript: protocol
      .replace(/vbscript:/gi, "")
      // Trim whitespace
      .trim()
  );
}

/**
 * Sanitize email input — hanya izinkan karakter email yang valid.
 *
 * @example
 * sanitizeEmail("user@example.com") // "user@example.com"
 * sanitizeEmail("user'@example.com OR 1=1") // "user@example.comOR11"
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== "string") return "";
  // Hanya izinkan karakter yang valid untuk email
  return input.replace(/[^a-zA-Z0-9@._+\-]/g, "").trim();
}

/**
 * Sanitize NIP — hanya izinkan angka dan spasi.
 *
 * @example
 * sanitizeNip("1234 5678 9012") // "1234 5678 9012"
 * sanitizeNip("1234'; DROP TABLE--") // "1234  "
 */
export function sanitizeNip(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[^0-9\s]/g, "").trim();
}

// ============================================
// 2. HTML Sanitization (untuk Map Popups & innerHTML)
// ============================================

/**
 * Escape HTML entities untuk mencegah XSS saat memasukkan data ke HTML string.
 * Gunakan ini untuk semua data yang diinterpolasi ke popup Leaflet.
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>') // "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 * escapeHtml('Kel. "Test" & Sons') // "Kel. &quot;Test&quot; &amp; Sons"
 */
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

  return str.replace(/[&<>"'/`]/g, (char) => htmlEscapeMap[char] ?? char);
}

/**
 * Escape value untuk digunakan di dalam HTML attribute.
 * Lebih strict dari escapeHtml untuk mencegah attribute injection.
 *
 * @example
 * escapeAttr('image.jpg" onload="alert(1)') // 'image.jpg&quot; onload=&quot;alert(1)'
 */
export function escapeAttr(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Sanitize URL — hanya izinkan http:, https:, dan path relatif.
 * Blokir javascript:, data:, vbscript: protocols.
 */
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

// ============================================
// 3. Rate Limiting (Client-side)
// ============================================

/**
 * Simple client-side rate limiter menggunakan Map.
 * Mencegah spam submit form dan brute force di client.
 */
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

// ============================================
// 4. CSRF Token (Client-side generation)
// ============================================

/**
 * Generate CSRF token menggunakan crypto.randomUUID.
 * Simpan di sessionStorage (BUKAN localStorage — lebih aman).
 */
/**
 * Generate CSRF token menggunakan double-submit cookie pattern.
 *
 * 1. Generate random token
 * 2. Simpan di cookie (accessible oleh server)
 * 3. Return token untuk dikirim di header (X-CSRF-Token)
 * 4. Server memverifikasi header === cookie
 *
 * Ini aman karena:
 * - Attacker dari domain lain TIDAK bisa membaca cookie kita (SameSite + same-origin policy)
 * - Attacker TIDAK bisa mengetahui nilai token untuk dikirim di header
 * - Server memastikan kedua nilai cocok
 */
export function generateCsrfToken(): string {
  if (typeof window === "undefined") return "";

  const token = crypto.randomUUID();

  // Set cookie dengan SameSite=Strict agar tidak dikirim dari cross-origin
  document.cookie = `csrf-token=${token}; path=/; SameSite=Strict; max-age=600`;

  return token;
}

// ============================================
// 5. Password Strength Validation
// ============================================

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  suggestions: string[];
}

/**
 * Evaluasi kekuatan password.
 */
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
