/** Form Validation Schemas — Zod, isomorphic (client + server). */

import { z } from "zod";

import { sanitizeEmail, sanitizeInput, sanitizeNip } from "@/lib/security";

// --- Login Form ---

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
    .transform(sanitizeNip)
    .refine((val: string) => /^\d{18}$/.test(val), "NIP harus tepat 18 digit"),

  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password terlalu panjang"),
});

// --- Lupa Password ---

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang")
    .transform(sanitizeEmail),

  nip: z
    .string()
    .min(1, "NIP wajib diisi")
    .transform(sanitizeNip)
    .refine((val: string) => /^\d{18}$/.test(val), "NIP harus 18 digit"),
});

const phoneSchema = z
  .string()
  .max(50, "Nomor telepon terlalu panjang")
  .transform((value) =>
    sanitizeInput(value).replace(/[^\d+\-\s()]/g, "").trim()
  );

const adminUserBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(120, "Nama terlalu panjang")
    .transform((value) => sanitizeInput(value).replace(/\s+/g, " ").trim()),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang")
    .transform(sanitizeEmail),
  nip: z
    .string()
    .min(1, "NIP wajib diisi")
    .transform(sanitizeNip)
    .refine((val) => /^\d{18}$/.test(val), "NIP harus tepat 18 digit"),
  phone: phoneSchema.optional().default(""),
  role: z.enum(["admin", "user"], {
    error: "Role tidak valid.",
  }),
  isActive: z.boolean(),
});

export const adminUserCreateSchema = adminUserBaseSchema.extend({
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password terlalu panjang"),
});

export const adminUserUpdateSchema = adminUserBaseSchema.extend({
  password: z
    .string()
    .max(128, "Password terlalu panjang")
    .optional()
    .transform((value) => value?.trim() ?? ""),
});

export const adminFaqMutationSchema = z.object({
  question: z
    .string()
    .min(1, "Pertanyaan wajib diisi")
    .max(500, "Pertanyaan terlalu panjang")
    .transform((value) => sanitizeInput(value).replace(/\s+/g, " ").trim()),
  answer: z
    .string()
    .min(1, "Jawaban wajib diisi")
    .max(5000, "Jawaban terlalu panjang")
    .transform((value) => sanitizeInput(value).trim()),
  is_active: z.boolean({
    error: "Status publikasi tidak valid.",
  }),
});

// --- Validation Helper ---

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/** Validasi data dengan Zod schema dan kembalikan hasil terstruktur. */
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
