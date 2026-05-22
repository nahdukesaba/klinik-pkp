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
const TRANSIENT_API_ERROR_PATTERN =
  /prepared statement|SQLSTATE\s+(42P05|26000)/i;

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
  backendPageLimit?: number;
  allowPartialResults?: boolean;
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

function getErrorPayloadText(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return "";
  }
}

function isTransientApiErrorPayload(payload: unknown) {
  return TRANSIENT_API_ERROR_PATTERN.test(getErrorPayloadText(payload));
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

function createRequestSignal(
  timeoutController: AbortController,
  externalSignal?: AbortSignal | null
) {
  if (!externalSignal) {
    return timeoutController.signal;
  }

  if (externalSignal.aborted) {
    return externalSignal;
  }

  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([timeoutController.signal, externalSignal]);
  }

  const controller = new AbortController();
  const abort = () => controller.abort();
  timeoutController.signal.addEventListener("abort", abort, { once: true });
  externalSignal.addEventListener("abort", abort, { once: true });
  return controller.signal;
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
    signal: externalSignal,
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
    const requestSignal = createRequestSignal(controller, externalSignal);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: requestSignal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const isRetryableTransient500 =
          response.status === 500 && isTransientApiErrorPayload(payload);

        if (
          (shouldRetryStatus(response.status) || isRetryableTransient500) &&
          attempt < retry
        ) {
          const delayMs = getRetryDelayMs(response, retryDelayMs, attempt);
          await sleep(delayMs);
          continue;
        }
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
      if (externalSignal?.aborted) {
        throw error;
      }

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

function getApiResponseErrorText(response: ApiResponse<unknown>) {
  if (typeof response.error === "string") {
    return response.error;
  }

  return [
    response.message,
    response.error?.code,
    response.error?.message,
    response.details ? JSON.stringify(response.details) : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}

function isTransientApiListResponse(response: ApiResponse<unknown>) {
  return !response.success &&
    TRANSIENT_API_ERROR_PATTERN.test(getApiResponseErrorText(response));
}

async function fetchApiListPage<T>(
  endpoint: string,
  query: ApiQueryParams | undefined,
  requestOptions: ApiRequestOptions | undefined,
  errorMessage: string
): Promise<ApiListPage<T>> {
  const retry = requestOptions?.retry ?? DEFAULT_RETRY_COUNT;
  const retryDelayMs = requestOptions?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  for (let attempt = 0; attempt <= retry; attempt += 1) {
    const response = await apiClient.get<ApiResponse<unknown>>(
      buildApiEndpoint(endpoint, query),
      requestOptions
    );

    if (isTransientApiListResponse(response) && attempt < retry) {
      await sleep(getRetryDelayMs(null, retryDelayMs, attempt));
      continue;
    }

    return normalizeApiListPage<T>(response, errorMessage);
  }

  throw new Error(errorMessage);
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

function getEffectivePageLimit(
  meta: ApiListPage<unknown>["meta"],
  requestedLimit: number | undefined,
  itemCount: number
) {
  if (typeof meta.limit === "number" && Number.isFinite(meta.limit) && meta.limit > 0) {
    return Math.trunc(meta.limit);
  }

  if (requestedLimit && itemCount > 0 && itemCount < requestedLimit) {
    return itemCount;
  }

  return requestedLimit ?? Math.max(itemCount, 1);
}

function getTotalRecords(
  meta: ApiListPage<unknown>["meta"],
  fallbackCount: number
) {
  return typeof meta.totalRecords === "number" &&
    Number.isFinite(meta.totalRecords) &&
    meta.totalRecords >= 0
    ? Math.trunc(meta.totalRecords)
    : fallbackCount;
}

function getBackendQuery(
  query: ApiQueryParams | undefined,
  backendPageLimit: number | undefined
) {
  const requestedLimit = getPositiveNumberQueryValue(query?.limit);

  if (
    !query ||
    !backendPageLimit ||
    !requestedLimit ||
    requestedLimit <= backendPageLimit
  ) {
    return query;
  }

  return {
    ...query,
    limit: backendPageLimit,
  };
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

async function fetchApiListPages<T>(
  endpoint: string,
  query: ApiQueryParams | undefined,
  requestOptions: ApiRequestOptions | undefined,
  errorMessage: string,
  startPage: number,
  endPage: number,
  limit: number,
  knownPages: Map<number, T[]> = new Map()
) {
  const items: T[] = [];

  for (let page = startPage; page <= endPage; page += 1) {
    const knownItems = knownPages.get(page);
    if (knownItems) {
      items.push(...knownItems);
      continue;
    }

    const nextPage = await fetchApiListPage<T>(
      endpoint,
      {
        ...query,
        page,
        limit,
      },
      requestOptions,
      errorMessage
    );

    items.push(...nextPage.items);
  }

  return items;
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
    backendPageLimit,
    allowPartialResults = false,
  } = options;
  const backendQuery = getBackendQuery(query, backendPageLimit);

  const initialPage = await fetchApiListPage<TApi>(
    endpoint,
    backendQuery,
    requestOptions,
    errorMessage
  );

  const items = [...initialPage.items];
  const requestedPage = getPositiveNumberQueryValue(query?.page);
  const requestedLimit = getPositiveNumberQueryValue(query?.limit);
  const backendRequestedLimit = getPositiveNumberQueryValue(backendQuery?.limit);
  const basePage = requestedPage ?? initialPage.meta.page ?? 1;
  const pageLimit = getEffectivePageLimit(
    initialPage.meta,
    backendRequestedLimit,
    initialPage.items.length
  );
  const totalRecords = getTotalRecords(initialPage.meta, items.length);
  const backendHonorsRequestedLimit =
    !requestedLimit || !pageLimit || pageLimit >= requestedLimit;

  if (
    collectAllPages &&
    (backendPageLimit !== undefined || backendHonorsRequestedLimit) &&
    totalRecords > items.length &&
    pageLimit &&
    items.length < totalRecords
  ) {
    const totalPages = Math.ceil(totalRecords / pageLimit);

    for (let page = basePage + 1; page <= totalPages; page += 1) {
      try {
        const nextPage = await fetchApiListPage<TApi>(
          endpoint,
          {
            ...backendQuery,
            page,
            limit: pageLimit,
          },
          requestOptions,
          errorMessage
        );

        items.push(...nextPage.items);
      } catch (error) {
        if (allowPartialResults && items.length > 0) {
          break;
        }

        throw error;
      }
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
    backendPageLimit,
    allowPartialResults = false,
  } = options;
  const requestedPage = getPositiveNumberQueryValue(query?.page);
  const requestedLimit = getPositiveNumberQueryValue(query?.limit);
  const shouldUseBackendCompatLimit =
    requestedPage !== undefined &&
    requestedLimit !== undefined &&
    backendPageLimit !== undefined &&
    requestedLimit > backendPageLimit;
  const initialBackendLimit = shouldUseBackendCompatLimit
    ? backendPageLimit
    : requestedLimit;
  const initialBackendPage =
    shouldUseBackendCompatLimit && initialBackendLimit
      ? Math.floor(
          ((requestedPage - 1) * requestedLimit) / initialBackendLimit
        ) + 1
      : requestedPage;
  const backendQuery =
    initialBackendPage && initialBackendLimit
      ? {
          ...query,
          page: initialBackendPage,
          limit: initialBackendLimit,
        }
      : query;

  const pageResult = await fetchApiListPage<TApi>(
    endpoint,
    backendQuery,
    requestOptions,
    errorMessage
  );
  const backendLimit = getEffectivePageLimit(
    pageResult.meta,
    initialBackendLimit,
    pageResult.items.length
  );
  const totalRecords = getTotalRecords(pageResult.meta, pageResult.items.length);
  const shouldRepage = Boolean(
    backendPageLimit !== undefined &&
    requestedPage &&
    requestedLimit &&
    backendLimit > 0 &&
    backendLimit < requestedLimit &&
    totalRecords > pageResult.items.length
  );

  if (
    shouldRepage &&
    requestedPage !== undefined &&
    requestedLimit !== undefined
  ) {
    const startPage =
      Math.floor(((requestedPage - 1) * requestedLimit) / backendLimit) + 1;
    const endPage = Math.min(
      Math.ceil(totalRecords / backendLimit),
      Math.ceil((requestedPage * requestedLimit) / backendLimit)
    );
    const knownPages = new Map<number, TApi[]>();

    if (pageResult.meta.page) {
      knownPages.set(pageResult.meta.page, pageResult.items);
    }

    let rangeItems: TApi[];

    try {
      rangeItems = await fetchApiListPages<TApi>(
        endpoint,
        {
          ...query,
          limit: backendLimit,
        },
        requestOptions,
        errorMessage,
        startPage,
        endPage,
        backendLimit,
        knownPages
      );
    } catch (error) {
      if (!allowPartialResults || pageResult.items.length === 0) {
        throw error;
      }

      rangeItems = pageResult.items;
    }
    const startOffset = ((requestedPage - 1) * requestedLimit) % backendLimit;
    const pageItems = rangeItems.slice(startOffset, startOffset + requestedLimit);

    return {
      items: transform
        ? pageItems.map(transform)
        : (pageItems as unknown as TOutput[]),
      meta: normalizeApiPaginationMeta(pageResult.meta, query, pageItems.length),
    };
  }

  const pageItems = pageResult.items;

  return {
    items: transform
      ? pageItems.map(transform)
      : (pageItems as unknown as TOutput[]),
    meta: normalizeApiPaginationMeta(pageResult.meta, query, pageItems.length),
  };
}
