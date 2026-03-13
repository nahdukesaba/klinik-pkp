/** API Client — terpusat untuk fetch data dari backend via Next.js rewrite. */

import { getApiUrl } from "@/lib/constants";

// --- Error Class ---

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

/** Custom error class untuk API errors dengan HTTP status code. */
export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
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

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

// --- Fetch Helper ---

const DEFAULT_TIMEOUT_MS = 30_000;

/** Generic fetch helper — handle error, timeout, dan JSON parsing. */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // Header untuk melewati warning page ngrok free tier
    "ngrok-skip-browser-warning": "true",
    ...options?.headers,
  };

  const url = getApiUrl(endpoint);

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
    // Rethrow ApiError langsung
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

// --- Public API Client ---

/** API client menggunakan proxy rewrite Next.js: /api/ext/* → backend. */
export const apiClient = {
  /** GET request ke endpoint API */
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),
};
