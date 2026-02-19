/**
 * API Client
 *
 * Centralized API client untuk fetch data dari backend.
 * Otomatis menggunakan API_BASE_URL dari environment variable.
 *
 * @module api-client
 */

import { getApiUrl } from "@/lib/constants";

/**
 * Fetch options dengan default headers
 */
interface FetchOptions extends RequestInit {
  /** Tambahkan token auth jika ada */
  includeAuth?: boolean;
}

/**
 * Generic API fetch helper
 * Otomatis handle error dan parsing JSON
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const { includeAuth, ...fetchOptions } = options ?? {};

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Jika includeAuth = true, tambahkan Authorization header
  // (untuk future implementation dengan token-based auth)
  if (includeAuth) {
    // const token = getAuthToken(); // Implementasi sesuai kebutuhan
    // headers.Authorization = `Bearer ${token}`;
  }

  const url = getApiUrl(endpoint);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Convenience methods untuk HTTP verbs
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Contoh penggunaan:
 *
 * // GET request
 * const data = await apiClient.get<SosialisasiData[]>('/sosialisasi');
 *
 * // POST request
 * const result = await apiClient.post('/sosialisasi', {
 *   title: 'New Event',
 *   date: '2024-01-01'
 * });
 *
 * // Dengan auth
 * const data = await apiClient.get<UserData>('/user/profile', {
 *   includeAuth: true
 * });
 */
