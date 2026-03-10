/**
 * API Client
 *
 * Client terpusat untuk fetch data dari backend.
 * Otomatis menambahkan header ngrok-skip-browser-warning
 * dan menggunakan base URL dari environment variable.
 *
 * Fitur:
 * - ApiError class dengan HTTP status code untuk error handling spesifik
 * - Timeout otomatis (30 detik) mencegah request menggantung
 * - Logging hanya di development mode
 *
 * Saat ini hanya GET yang dipakai. Tambahkan method lain
 * (POST, PUT, PATCH, DELETE) jika/saat diperlukan.
 *
 * @module api-client
 */

import { getApiUrl } from "@/lib/constants";

// ============================================
// Error Class — HTTP status-aware
// ============================================

/** Pesan error ramah pengguna berdasarkan HTTP status code */
const STATUS_MESSAGES: Record<number, string> = {
  400: "Permintaan tidak valid. Silakan coba lagi.",
  401: "Sesi Anda telah berakhir. Silakan login ulang.",
  403: "Akses ditolak. Anda tidak memiliki izin untuk mengakses data ini.",
  404: "Data yang diminta tidak ditemukan di server.",
  408: "Waktu permintaan habis. Server terlalu lama merespons.",
  429: "Terlalu banyak permintaan. Silakan tunggu sebentar.",
  500: "Terjadi kesalahan pada server. Tim teknis telah dinotifikasi.",
  502: "Server sedang tidak dapat dijangkau. Silakan coba beberapa saat lagi.",
  503: "Server sedang dalam pemeliharaan. Silakan coba beberapa saat lagi.",
  504: "Waktu respons server habis. Silakan coba lagi.",
};

/**
 * Custom error class untuk API errors.
 * Menyimpan HTTP status code sehingga UI bisa menampilkan
 * pesan error yang sesuai berdasarkan tipe masalah.
 *
 * @example
 * try {
 *   await apiClient.get("/rusun");
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.log(error.status);       // 500
 *     console.log(error.statusText);   // "Internal Server Error"
 *     console.log(error.userMessage);  // "Terjadi kesalahan pada server..."
 *   }
 * }
 */
export class ApiError extends Error {
  /** HTTP status code (400, 403, 500, dll.) */
  readonly status: number;
  /** HTTP status text ("Not Found", "Internal Server Error", dll.) */
  readonly statusText: string;
  /** Pesan ramah pengguna dalam Bahasa Indonesia */
  readonly userMessage: string;

  constructor(status: number, statusText: string) {
    const userMessage = STATUS_MESSAGES[status]
      ?? (status >= 500
        ? "Terjadi kesalahan pada server. Silakan coba lagi."
        : "Terjadi kesalahan saat mengambil data.");

    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.userMessage = userMessage;
  }

  /** Apakah error berasal dari sisi server (5xx) */
  get isServerError(): boolean {
    return this.status >= 500;
  }

  /** Apakah error berasal dari sisi client (4xx) */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** Apakah error karena jaringan/timeout (bukan HTTP error) */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

// ============================================
// Fetch Helper (internal)
// ============================================

/** Default timeout: 30 detik */
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Generic fetch helper (internal).
 * Otomatis handle error response, timeout, dan parsing JSON.
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // Header untuk melewati warning page ngrok free tier.
    // Request lewat same-origin rewrite (/api/ext) → backend ngrok.
    "ngrok-skip-browser-warning": "true",
    ...options?.headers,
  };

  const url = getApiUrl(endpoint);

  // AbortController untuk timeout — mencegah request menggantung
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    return await response.json();
  } catch (error) {
    // Rethrow ApiError langsung tanpa wrapping
    if (error instanceof ApiError) {
      if (process.env.NODE_ENV === "development") {
        console.error(`[API ${error.status}] ${endpoint}: ${error.message}`);
      }
      throw error;
    }

    // AbortError → timeout
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(408, "Request Timeout");
    }

    // Network error (server mati, tidak ada internet, dll.)
    throw new ApiError(0, (error as Error).message || "Network Error");
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// Public API Client
// ============================================

/**
 * API client dengan method HTTP yang tersedia.
 * Menggunakan proxy rewrite Next.js: /api/ext/* → backend.
 *
 * @example
 * const data = await apiClient.get<ApiResponse<Rusun[]>>('/rusun');
 */
export const apiClient = {
  /** GET request ke endpoint API */
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),
};
