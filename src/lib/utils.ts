/**
 * Utility Functions
 *
 * Helper functions yang digunakan di seluruh aplikasi.
 *
 * @module utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan class names dengan Tailwind CSS merge.
 * Menggunakan clsx untuk conditional classes dan twMerge untuk menghindari
 * konflik utility classes Tailwind.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
