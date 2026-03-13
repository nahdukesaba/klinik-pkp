/** Form Validation Schemas — Zod, isomorphic (client + server). */

import { z } from "zod";

import { sanitizeEmail, sanitizeNip } from "@/lib/security";

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
