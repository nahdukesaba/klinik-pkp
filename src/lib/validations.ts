/**
 * Form Validation Schemas
 *
 * Skema validasi menggunakan Zod untuk semua form di aplikasi.
 * Validasi ini berjalan di client DAN server (isomorphic).
 *
 * Setiap skema melakukan:
 * 1. Type checking (tipe data benar)
 * 2. Format validation (email valid, NIP format benar)
 * 3. Length validation (min/max karakter)
 * 4. Sanitization (hapus karakter berbahaya)
 *
 * @module validations
 */

import { z } from "zod";

import { sanitizeEmail, sanitizeInput, sanitizeNip } from "@/lib/security";

// ============================================
// Login Form Schema
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang")
    .transform(sanitizeEmail),

  nip: z
    .string()
    .min(1, "NIP wajib diisi")
    .min(8, "NIP minimal 8 digit")
    .max(20, "NIP maksimal 20 digit")
    .transform(sanitizeNip)
    .refine(
      (val: string) => /^\d[\d\s]*$/.test(val),
      "NIP hanya boleh berisi angka"
    ),

  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password terlalu panjang"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// Search Form Schema
// ============================================

export const searchSchema = z.object({
  query: z
    .string()
    .max(200, "Pencarian terlalu panjang")
    .transform(sanitizeInput),
});

export type SearchFormData = z.infer<typeof searchSchema>;

// ============================================
// Contact Form Schema (untuk halaman kontak)
// ============================================

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama terlalu panjang")
    .transform(sanitizeInput),

  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang")
    .transform(sanitizeEmail),

  subject: z
    .string()
    .min(1, "Subjek wajib diisi")
    .max(200, "Subjek terlalu panjang")
    .transform(sanitizeInput),

  message: z
    .string()
    .min(10, "Pesan minimal 10 karakter")
    .max(2000, "Pesan terlalu panjang")
    .transform(sanitizeInput),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ============================================
// Helper: Validate and return errors
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Validasi data dengan Zod schema dan kembalikan hasil terstruktur.
 *
 * @example
 * const result = validateForm(loginSchema, { email, nip, password });
 * if (!result.success) {
 *   // Tampilkan result.errors ke UI
 * }
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
