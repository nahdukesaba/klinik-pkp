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
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(128, "Password terlalu panjang"),

    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  });

const phoneSchema = z
  .string()
  .max(50, "Nomor telepon terlalu panjang")
  .transform((value) =>
    sanitizeInput(value)
      .replace(/[^\d+\-\s()]/g, "")
      .trim(),
  );

const adminUserNameSchema = z
  .string()
  .min(1, "Nama wajib diisi")
  .max(120, "Nama terlalu panjang")
  .transform((value) => sanitizeInput(value).replace(/\s+/g, " ").trim());

const adminUserBaseSchema = z.object({
  fullName: adminUserNameSchema,
  nip: z
    .string()
    .transform(sanitizeNip)
    .refine((val) => val === "" || /^\d{18}$/.test(val), "NIP harus tepat 18 digit"),
  phone: phoneSchema.optional().default(""),
  nik: z.string().max(32, "NIK terlalu panjang").transform(sanitizeInput).optional().default(""),
  alamat: z.string().max(500, "Alamat terlalu panjang").transform(sanitizeInput).optional().default(""),
  gelarDepan: z.string().max(50, "Gelar depan terlalu panjang").transform(sanitizeInput).optional().default(""),
  gelarBelakang: z.string().max(50, "Gelar belakang terlalu panjang").transform(sanitizeInput).optional().default(""),
  role: z.enum(["admin", "user"], {
    error: "Role tidak valid.",
  }),
  status: z.enum(["pending", "approved", "rejected", "disabled"], {
    error: "Status membership tidak valid.",
  }),
});

export const adminUserCreateSchema = adminUserBaseSchema.extend({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang")
    .transform(sanitizeEmail),
});

export const adminUserUpdateSchema = adminUserBaseSchema;

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

export const adminExternalResourceNameSchema = z.enum([
  "faq",
  "bsps",
  "kumuh",
  "rusun",
  "bank-desain",
  "sosialisasi",
]);

export const adminExternalResourceIdSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "ID resource harus berupa angka positif.");

// --- Validation Helper ---

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/** Validasi data dengan Zod schema dan kembalikan hasil terstruktur. */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
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
