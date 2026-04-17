/** API Client — terpusat untuk fetch data dari backend via proxy Next.js. */

import { getApiUrl } from "@/lib/constants";
import {
  extractApiCollectionItems,
  extractApiPaginationMeta,
  type ApiResponse,
} from "@/types/api";

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
const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_RETRY_DELAY_MS = 400;
const MAX_RETRY_DELAY_MS = 4_000;

type ApiFetchOptions = RequestInit & {
  retry?: number;
  retryDelayMs?: number;
  suppressErrorLog?: boolean;
};

export type ApiRequestOptions = Omit<ApiFetchOptions, "method">;
export type ApiQueryValue = string | number | boolean | null | undefined;
export type ApiQueryParam = ApiQueryValue | readonly ApiQueryValue[];
export type ApiQueryParams = Record<string, ApiQueryParam>;

interface FetchApiListOptions<TApi, TOutput> {
  query?: ApiQueryParams;
  transform?: (item: TApi) => TOutput;
  errorMessage?: string;
  requestOptions?: ApiRequestOptions;
  collectAllPages?: boolean;
}

export interface ApiPaginationMeta {
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiPaginatedResult<T> {
  items: T[];
  meta: ApiPaginationMeta;
}

interface ApiListPage<T> {
  items: T[];
  meta: {
    totalRecords?: number;
    page?: number;
    limit?: number;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status: number): boolean {
  return status === 408 || status === 429 || status === 502 || status === 503 || status === 504;
}

function getRetryDelayMs(response: Response | null, baseDelayMs: number, attempt: number): number {
  const retryAfter = response?.headers.get("retry-after");
  if (retryAfter) {
    const retryAfterSeconds = Number(retryAfter);
    if (!Number.isNaN(retryAfterSeconds)) {
      return Math.min(retryAfterSeconds * 1000, MAX_RETRY_DELAY_MS);
    }

    const retryAfterDate = Date.parse(retryAfter);
    if (!Number.isNaN(retryAfterDate)) {
      const waitMs = retryAfterDate - Date.now();
      if (waitMs > 0) return Math.min(waitMs, MAX_RETRY_DELAY_MS);
    }
  }

  const jitterMs = Math.floor(Math.random() * 100);
  const backoffMs = baseDelayMs * (2 ** attempt);
  return Math.min(backoffMs + jitterMs, MAX_RETRY_DELAY_MS);
}

function appendQueryValue(
  params: URLSearchParams,
  key: string,
  value: ApiQueryValue
) {
  if (value == null || value === "") {
    return;
  }

  params.append(key, String(value));
}

export function buildApiEndpoint(endpoint: string, query?: ApiQueryParams) {
  if (!query) {
    return endpoint;
  }

  const [pathname, existingSearch = ""] = endpoint.split("?");
  const params = new URLSearchParams(existingSearch);

  for (const [key, rawValue] of Object.entries(query)) {
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        appendQueryValue(params, key, value);
      }
      continue;
    }

    appendQueryValue(params, key, rawValue as ApiQueryValue);
  }

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/** Generic fetch helper — handle error, timeout, retry, dan JSON parsing. */
async function apiFetch<T>(
  endpoint: string,
  options?: ApiFetchOptions
): Promise<T> {
  const {
    retry = DEFAULT_RETRY_COUNT,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    suppressErrorLog = false,
    ...fetchOptions
  } =
    options ?? {};

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (fetchOptions.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = getApiUrl(endpoint);

  for (let attempt = 0; attempt <= retry; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        if (shouldRetryStatus(response.status) && attempt < retry) {
          const delayMs = getRetryDelayMs(response, retryDelayMs, attempt);
          await sleep(delayMs);
          continue;
        }
        throw new ApiError(response.status, response.statusText);
      }

      return await response.json();
    } catch (error) {
      // AbortError → timeout
      if (error instanceof DOMException && error.name === "AbortError") {
        if (attempt < retry) {
          const delayMs = getRetryDelayMs(null, retryDelayMs, attempt);
          await sleep(delayMs);
          continue;
        }
        throw new ApiError(408, "Request Timeout");
      }

      if (error instanceof ApiError) {
        if (shouldRetryStatus(error.status) && attempt < retry) {
          const delayMs = getRetryDelayMs(null, retryDelayMs, attempt);
          await sleep(delayMs);
          continue;
        }
        if (process.env.NODE_ENV === "development" && !suppressErrorLog) {
          console.error(`[API ${error.status}] ${endpoint}: ${error.message}`);
        }
        throw error;
      }

      if (attempt < retry) {
        const delayMs = getRetryDelayMs(null, retryDelayMs, attempt);
        await sleep(delayMs);
        continue;
      }

      // Network error (server mati, tidak ada internet, dll.)
      throw new ApiError(0, (error as Error).message || "Network Error");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new ApiError(0, "Network Error");
}

// --- Public API Client ---

/** API client menggunakan proxy route handler Next.js: /api/ext/* -> backend. */
export const apiClient = {
  /** GET request ke endpoint API */
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),
};

function normalizeApiListPage<T>(
  response: ApiResponse<unknown>,
  errorMessage: string
): ApiListPage<T> {
  if (!response.success) {
    throw new Error(response.error ?? response.message ?? errorMessage);
  }

  const items = extractApiCollectionItems<T>(response.data);
  if (!items) {
    throw new Error(errorMessage);
  }

  return {
    items,
    meta: extractApiPaginationMeta(response.data),
  };
}

async function fetchApiListPage<T>(
  endpoint: string,
  query: ApiQueryParams | undefined,
  requestOptions: ApiRequestOptions | undefined,
  errorMessage: string
): Promise<ApiListPage<T>> {
  const response = await apiClient.get<ApiResponse<unknown>>(
    buildApiEndpoint(endpoint, query),
    requestOptions
  );

  return normalizeApiListPage<T>(response, errorMessage);
}

function getPositiveNumberQueryValue(value: ApiQueryParam | undefined) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeApiPaginationMeta(
  meta: ApiListPage<unknown>["meta"],
  query: ApiQueryParams | undefined,
  itemCount: number
): ApiPaginationMeta {
  const requestedPage = getPositiveNumberQueryValue(query?.page);
  const requestedLimit = getPositiveNumberQueryValue(query?.limit);
  const page = requestedPage ?? meta.page ?? 1;
  const limit = requestedLimit ?? meta.limit ?? Math.max(itemCount, 1);
  const totalRecords = Math.max(meta.totalRecords ?? itemCount, itemCount);
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

  return {
    totalRecords,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function fetchApiList<TApi, TOutput = TApi>(
  endpoint: string,
  options: FetchApiListOptions<TApi, TOutput> = {}
): Promise<TOutput[]> {
  const {
    query,
    transform,
    errorMessage = "Gagal mengambil data dari server",
    requestOptions,
    collectAllPages = true,
  } = options;

  const initialPage = await fetchApiListPage<TApi>(
    endpoint,
    query,
    requestOptions,
    errorMessage
  );

  const items = [...initialPage.items];
  const basePage =
    typeof query?.page === "number" && Number.isFinite(query.page)
      ? Number(query.page)
      : initialPage.meta.page ?? 1;
  const pageLimit =
    typeof query?.limit === "number" && Number.isFinite(query.limit)
      ? Number(query.limit)
      : initialPage.meta.limit;

  if (
    collectAllPages &&
    initialPage.meta.totalRecords &&
    pageLimit &&
    items.length < initialPage.meta.totalRecords
  ) {
    const totalPages = Math.ceil(initialPage.meta.totalRecords / pageLimit);

    for (let page = basePage + 1; page <= totalPages; page += 1) {
      const nextPage = await fetchApiListPage<TApi>(
        endpoint,
        {
          ...query,
          page,
          limit: pageLimit,
        },
        requestOptions,
        errorMessage
      );

      items.push(...nextPage.items);
    }
  }

  if (!transform) {
    return items as unknown as TOutput[];
  }

  return items.map(transform);
}

export async function fetchApiListWithMeta<TApi, TOutput = TApi>(
  endpoint: string,
  options: Omit<FetchApiListOptions<TApi, TOutput>, "collectAllPages"> = {}
): Promise<ApiPaginatedResult<TOutput>> {
  const {
    query,
    transform,
    errorMessage = "Gagal mengambil data dari server",
    requestOptions,
  } = options;

  const pageResult = await fetchApiListPage<TApi>(
    endpoint,
    query,
    requestOptions,
    errorMessage
  );

  return {
    items: transform
      ? pageResult.items.map(transform)
      : (pageResult.items as unknown as TOutput[]),
    meta: normalizeApiPaginationMeta(pageResult.meta, query, pageResult.items.length),
  };
}
