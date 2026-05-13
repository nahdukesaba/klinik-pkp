/** API Client — terpusat untuk fetch data dari backend via proxy Next.js. */

import {
  normalizeApiError,
  type ApiErrorDetails,
} from "@/lib/api-response";
import { getApiUrl } from "@/lib/constants";
import type {
  ApiResponse,
  CoordinateApi,
  DistrictApi,
  RegionApi,
  VillageApi,
} from "@/types/api";

// Re-export types yang sering diimport bersama api-client
export type { ApiResponse, CoordinateApi, DistrictApi, RegionApi, VillageApi };

// --- Error Class ---

/** Custom error class untuk API errors dengan HTTP status code. */
export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly userMessage: string;
  readonly code: string;
  readonly details?: ApiErrorDetails;

  constructor(
    status: number,
    statusText: string,
    options: {
      message?: string;
      code?: string;
      details?: ApiErrorDetails;
    } = {}
  ) {
    const fallbackError = normalizeApiError(status, null, options.message);
    const userMessage = options.message ?? fallbackError.message;

    super(userMessage);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.userMessage = userMessage;
    this.code = options.code ?? fallbackError.code;
    this.details = options.details;
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

// --- Extract helpers (dipindahkan dari types/api.ts) ---

const API_COLLECTION_KEYS = [
  "data",
  "items",
  "rows",
  "records",
  "results",
  "list",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getNumberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Ekstrak array items dari response API yang bisa berbentuk array langsung atau object dengan key standar */
export function extractApiCollectionItems<T>(data: unknown): T[] | null {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (!isRecord(data)) {
    return null;
  }

  for (const key of API_COLLECTION_KEYS) {
    const candidate = data[key];
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return null;
}

/** Ekstrak metadata paginasi dari raw response API */
export function extractApiPaginationMeta(data: unknown) {
  if (!isRecord(data)) {
    return {} as {
      totalRecords?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  }

  return {
    totalRecords:
      getNumberValue(data.total_records) ?? getNumberValue(data.total),
    page: getNumberValue(data.page),
    limit: getNumberValue(data.limit),
    totalPages:
      getNumberValue(data.total_pages) ?? getNumberValue(data.total_page),
  };
}

// --- Helper: ekstrak nama lokasi dari nested objects ---

export function extractVillageName(village?: VillageApi): string {
  return village?.name ?? "";
}

/** Fallback ke village.district jika district langsung tidak tersedia */
export function extractDistrictName(
  district?: DistrictApi,
  village?: VillageApi
): string {
  return district?.name ?? village?.district?.name ?? "";
}

/** Fallback ke district.region atau village.district.region */
export function extractRegionName(
  region?: RegionApi,
  district?: DistrictApi,
  village?: VillageApi
): string {
  return (
    region?.name ??
    district?.region?.name ??
    village?.district?.region?.name ??
    ""
  );
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
    totalPages?: number;
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
    suppressErrorLog: _suppressErrorLog = false,
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
        const payload = await response.json().catch(() => null);
        const normalizedError = normalizeApiError(
          response.status,
          payload,
          response.statusText
        );

        throw new ApiError(response.status, response.statusText, {
          message: normalizedError.message,
          code: normalizedError.code,
          details: normalizedError.details,
        });
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
        const normalizedError = normalizeApiError(408, null, "Request Timeout");
        throw new ApiError(408, "Request Timeout", {
          message: normalizedError.message,
          code: normalizedError.code,
        });
      }

      if (error instanceof ApiError) {
        if (shouldRetryStatus(error.status) && attempt < retry) {
          const delayMs = getRetryDelayMs(null, retryDelayMs, attempt);
          await sleep(delayMs);
          continue;
        }
        throw error;
      }

      if (attempt < retry) {
        const delayMs = getRetryDelayMs(null, retryDelayMs, attempt);
        await sleep(delayMs);
        continue;
      }

      const normalizedError = normalizeApiError(
        0,
        null,
        error instanceof Error ? error.message : "Network Error"
      );
      throw new ApiError(0, "Network Error", {
        message: normalizedError.message,
        code: normalizedError.code,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const normalizedError = normalizeApiError(0, null, "Network Error");
  throw new ApiError(0, "Network Error", {
    message: normalizedError.message,
    code: normalizedError.code,
  });
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
    throw new Error(
      typeof response.error === "string"
        ? response.error
        : response.error?.message ?? response.message ?? errorMessage
    );
  }

  const items = extractApiCollectionItems<T>(response.data);
  if (!items) {
    throw new Error(errorMessage);
  }

  return {
    items,
    meta: {
      ...extractApiPaginationMeta(response.data),
      ...extractApiPaginationMeta(response.meta),
    },
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
  const totalPagesFromMeta =
    typeof meta.totalPages === "number" &&
    Number.isFinite(meta.totalPages) &&
    meta.totalPages > 0
      ? Math.trunc(meta.totalPages)
      : undefined;
  const page = requestedPage ?? meta.page ?? 1;
  const limit = requestedLimit ?? meta.limit ?? Math.max(itemCount, 1);
  const totalRecords = Math.max(
    meta.totalRecords ??
      (totalPagesFromMeta ? totalPagesFromMeta * limit : itemCount),
    itemCount
  );
  const totalPages = Math.max(
    1,
    totalPagesFromMeta ?? Math.ceil(totalRecords / limit)
  );

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
