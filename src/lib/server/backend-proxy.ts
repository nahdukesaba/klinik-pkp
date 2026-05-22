import "server-only";

import { type NextRequest, NextResponse } from "next/server";

import {
  extractApiCollectionItems,
  extractApiPaginationMeta,
} from "@/lib/api-client";
import { API_MAX_PAGE_LIMIT } from "@/lib/constants";
import {
  normalizeBackendPathname,
  requireBackendApiBaseUrl,
} from "@/lib/server/backend-config";
import {
  createJsonErrorResponse,
  createJsonResponse,
} from "@/lib/server/http";
import type { ApiResponse } from "@/types/api";

const BACKEND_TIMEOUT_MS = 30_000;
const BACKEND_GET_RETRY_ATTEMPTS = 2;
const BACKEND_GET_RETRY_DELAY_MS = 180;
const AGGREGATED_LIST_CACHE_TTL_MS = 2 * 60 * 1000;
const YEAR_OPTIONS_CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_AGGREGATED_BACKEND_PAGES = 50;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const INFRA_ERROR_STATUS = new Set([404, 502, 503, 520, 521, 522, 523, 524]);
const RETRYABLE_GET_STATUS = new Set([500, 502, 503, 504, 520, 521, 522, 523, 524]);
const TRANSIENT_BACKEND_ERROR_PATTERN =
  /prepared statement|SQLSTATE\s+(42P05|26000)/i;

const ALLOWED_REQUEST_HEADERS = new Set([
  "accept",
  "content-type",
  "if-none-match",
  "if-modified-since",
  "if-range",
  "range",
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "transfer-encoding",
  "connection",
  "set-cookie",
]);

const SAFE_LIST_RESOURCES = new Set([
  "bsps",
  "kumuh",
  "rusun",
  "sosialisasi",
  "bank-desain",
]);
const YEAR_QUERY_FIELDS = ["year", "year_given", "year_inspected"] as const;
const YEAR_OPTION_RESOURCES = {
  bsps: "year_given",
  kumuh: "year_inspected",
  rusun: "year_given",
} as const;

type CachedJsonPayload = {
  expiresAt: number;
  payload: unknown;
};

const serverPayloadCache = new Map<string, CachedJsonPayload>();

type NormalizedProxySearchParams =
  | { ok: true; searchParams: URLSearchParams }
  | { ok: false; response: NextResponse };

function buildBackendUrl(path: string[], searchParams: URLSearchParams) {
  const backendApiUrl = requireBackendApiBaseUrl();
  const joinedPath = normalizeBackendPathname(path.join("/"));
  const query = searchParams.toString();

  return query
    ? `${backendApiUrl}/${joinedPath}?${query}`
    : `${backendApiUrl}/${joinedPath}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPayloadText(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return "";
  }
}

function getBackendPayloadMessage(payload: unknown, fallback: string) {
  if (isRecord(payload)) {
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }

    if (
      isRecord(payload.error) &&
      typeof payload.error.message === "string" &&
      payload.error.message.trim()
    ) {
      return payload.error.message;
    }

    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
  }

  return fallback;
}

function getCachedPayload(key: string) {
  const cached = serverPayloadCache.get(key);

  if (!cached || cached.expiresAt <= Date.now()) {
    if (cached) {
      serverPayloadCache.delete(key);
    }
    return null;
  }

  return cached.payload;
}

function setCachedPayload(key: string, payload: unknown, ttlMs: number) {
  serverPayloadCache.set(key, {
    payload,
    expiresAt: Date.now() + ttlMs,
  });
}

function getIntegerParam(value: string | null) {
  if (value === null) {
    return undefined;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function normalizeProxySearchParams(
  searchParams: URLSearchParams
): NormalizedProxySearchParams {
  const normalized = new URLSearchParams(searchParams);
  const page = getIntegerParam(normalized.get("page"));
  const limit = getIntegerParam(normalized.get("limit"));

  if (page === null || (page !== undefined && page < 1)) {
    return {
      ok: false,
      response: createJsonErrorResponse(
        "Parameter page harus berupa angka bulat positif.",
        400,
        { page: "Gunakan angka 1 atau lebih." },
        "BAD_REQUEST"
      ),
    };
  }

  if (limit === null || (limit !== undefined && limit < 1)) {
    return {
      ok: false,
      response: createJsonErrorResponse(
        "Parameter limit harus berupa angka bulat positif.",
        400,
        { limit: `Gunakan angka 1 sampai ${API_MAX_PAGE_LIMIT}.` },
        "BAD_REQUEST"
      ),
    };
  }

  if (limit !== undefined) {
    normalized.set("limit", String(Math.min(limit, API_MAX_PAGE_LIMIT)));
  }

  for (const field of YEAR_QUERY_FIELDS) {
    const year = getIntegerParam(normalized.get(field));

    if (year === undefined) {
      continue;
    }

    if (year === null || year < MIN_YEAR || year > MAX_YEAR) {
      return {
        ok: false,
        response: createJsonErrorResponse(
          `Parameter ${field} tidak valid.`,
          400,
          { [field]: `Gunakan tahun antara ${MIN_YEAR} dan ${MAX_YEAR}.` },
          "BAD_REQUEST"
        ),
      };
    }

    normalized.set(field, String(year));
  }

  return { ok: true, searchParams: normalized };
}

function getSafeListRequestMeta(searchParams: URLSearchParams) {
  const page = getIntegerParam(searchParams.get("page")) ?? 1;
  const limit = Math.min(
    getIntegerParam(searchParams.get("limit")) ?? API_MAX_PAGE_LIMIT,
    API_MAX_PAGE_LIMIT
  );

  return { page, limit };
}

function isSafeListPath(path: string[]) {
  return path.length === 1 && SAFE_LIST_RESOURCES.has(path[0]);
}

function forwardRequestHeaders(incoming: Headers) {
  const forwarded = new Headers();

  for (const [key, value] of incoming.entries()) {
    if (ALLOWED_REQUEST_HEADERS.has(key.toLowerCase())) {
      forwarded.set(key, value);
    }
  }

  return forwarded;
}

function forwardResponseHeaders(backendHeaders: Headers) {
  const forwarded = new Headers();

  for (const [key, value] of backendHeaders.entries()) {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      forwarded.set(key, value);
    }
  }

  return forwarded;
}

function isInfrastructureErrorResponse(response: Response) {
  if (!INFRA_ERROR_STATUS.has(response.status)) {
    return false;
  }

  const contentType = response.headers.get("content-type") ?? "";
  return !contentType.includes("application/json");
}

function isRetryableMethod(method: string) {
  return method === "GET" || method === "HEAD";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isRetryableBackendResponse(response: Response) {
  if (!RETRYABLE_GET_STATUS.has(response.status)) {
    return false;
  }

  if (response.status !== 500) {
    return true;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return false;
  }

  const body = await response.clone().text().catch(() => "");
  return TRANSIENT_BACKEND_ERROR_PATTERN.test(body);
}

async function fetchBackendOnce(
  request: NextRequest,
  backendUrl: string,
  headers: Headers
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    return await fetch(backendUrl, {
      method: request.method,
      headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
      signal: controller.signal,
      // @ts-expect-error duplex diperlukan untuk streaming request body di Node.js fetch
      duplex: "half",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchBackendJsonOnce(backendUrl: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(backendUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);

    return { response, payload };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchBackendJson(backendUrl: string) {
  let lastMessage = "Backend tidak merespons.";

  for (let attempt = 1; attempt <= BACKEND_GET_RETRY_ATTEMPTS + 1; attempt += 1) {
    try {
      const { response, payload } = await fetchBackendJsonOnce(backendUrl);

      if (response.ok) {
        return payload as ApiResponse<unknown>;
      }

      lastMessage = getBackendPayloadMessage(
        payload,
        `Backend HTTP ${response.status}`
      );
      const isTransient500 =
        response.status === 500 &&
        TRANSIENT_BACKEND_ERROR_PATTERN.test(getPayloadText(payload));

      if (
        attempt <= BACKEND_GET_RETRY_ATTEMPTS &&
        (RETRYABLE_GET_STATUS.has(response.status) || isTransient500)
      ) {
        await sleep(BACKEND_GET_RETRY_DELAY_MS * attempt);
        continue;
      }

      throw new Error(lastMessage);
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : lastMessage;

      if (
        attempt <= BACKEND_GET_RETRY_ATTEMPTS &&
        TRANSIENT_BACKEND_ERROR_PATTERN.test(lastMessage)
      ) {
        await sleep(BACKEND_GET_RETRY_DELAY_MS * attempt);
        continue;
      }

      throw new Error(lastMessage);
    }
  }

  throw new Error(lastMessage);
}

function createEmptyListResponse(params: {
  page: number;
  limit: number;
  totalRecords?: number;
  totalPages?: number;
  warning?: string;
  partial?: boolean;
}) {
  return createJsonResponse({
    data: {
      items: [],
      total_records: params.totalRecords ?? 0,
      page: params.page,
      limit: params.limit,
      total_pages: params.totalPages ?? 1,
      partial: params.partial ?? false,
      warning: params.warning,
    },
  });
}

function createSafeListFallbackResponse(
  path: string[],
  searchParams: URLSearchParams,
  warning: string
) {
  if (!isSafeListPath(path)) {
    return null;
  }

  const { page, limit } = getSafeListRequestMeta(searchParams);

  return createEmptyListResponse({
    page,
    limit,
    partial: true,
    warning,
  });
}

function getYearOptionsConfig(path: string[]) {
  if (path.length !== 2 || path[1] !== "years") {
    return null;
  }

  const resource = path[0] as keyof typeof YEAR_OPTION_RESOURCES;
  const yearField = YEAR_OPTION_RESOURCES[resource];

  return yearField ? { resource, yearField } : null;
}

function getServerCacheKey(prefix: string, path: string[], params: URLSearchParams) {
  return `${prefix}:${path.join("/")}?${params.toString()}`;
}

async function fetchBackendListPages(path: string[], searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);
  const requestedLimit = getIntegerParam(params.get("limit")) ?? API_MAX_PAGE_LIMIT;
  const limit = Math.min(requestedLimit, API_MAX_PAGE_LIMIT);
  const items: unknown[] = [];
  let page = 1;
  let totalRecords = 0;
  let totalPages = 1;
  let partial = false;

  params.delete("all");
  params.set("limit", String(limit));

  while (page <= totalPages && page <= MAX_AGGREGATED_BACKEND_PAGES) {
    params.set("page", String(page));

    const payload = await fetchBackendJson(buildBackendUrl(path, params));
    if (!payload.success) {
      throw new Error(
        getBackendPayloadMessage(payload, "Backend mengembalikan response gagal.")
      );
    }

    const pageItems = extractApiCollectionItems<unknown>(payload.data) ?? [];
    const meta = {
      ...extractApiPaginationMeta(payload.data),
      ...extractApiPaginationMeta(payload.meta),
    };

    items.push(...pageItems);
    totalRecords = Math.max(meta.totalRecords ?? items.length, items.length);
    totalPages = Math.max(
      1,
      meta.totalPages ?? Math.ceil(totalRecords / limit)
    );

    if (pageItems.length === 0 || pageItems.length < limit) {
      break;
    }

    page += 1;
  }

  if (page <= totalPages && page >= MAX_AGGREGATED_BACKEND_PAGES) {
    partial = true;
  }

  return {
    items,
    total_records: totalRecords || items.length,
    page: 1,
    limit,
    total_pages: 1,
    partial,
  };
}

async function createAggregatedListResponse(
  path: string[],
  searchParams: URLSearchParams
) {
  if (!isSafeListPath(path) || searchParams.get("all") !== "true") {
    return null;
  }

  const params = new URLSearchParams(searchParams);
  params.delete("page");
  params.set("limit", String(getSafeListRequestMeta(searchParams).limit));
  const cacheKey = getServerCacheKey("list", path, params);
  const cached = getCachedPayload(cacheKey);

  if (cached) {
    return createJsonResponse({ data: cached });
  }

  try {
    const payload = await fetchBackendListPages(path, params);
    setCachedPayload(cacheKey, payload, AGGREGATED_LIST_CACHE_TTL_MS);

    return createJsonResponse({ data: payload });
  } catch {
    const { page, limit } = getSafeListRequestMeta(searchParams);

    return createEmptyListResponse({
      page,
      limit,
      partial: true,
      warning: "Backend lambat merespons. Data sementara belum dapat dibaca.",
    });
  }
}

async function createYearOptionsResponse(path: string[]) {
  const config = getYearOptionsConfig(path);

  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    all: "true",
    limit: String(API_MAX_PAGE_LIMIT),
  });
  const cacheKey = getServerCacheKey("years", [config.resource], params);
  const cached = getCachedPayload(cacheKey);

  if (cached) {
    return createJsonResponse({ data: { years: cached } });
  }

  try {
    const payload = await fetchBackendListPages([config.resource], params);
    const years = [...new Set(
      payload.items
        .map((item) => {
          if (!isRecord(item)) {
            return null;
          }

          const value = item[config.yearField];
          const year =
            typeof value === "number"
              ? value
              : typeof value === "string"
                ? Number.parseInt(value, 10)
                : NaN;

          return Number.isFinite(year) ? Math.trunc(year) : null;
        })
        .filter((year): year is number => year !== null)
    )].sort((left, right) => right - left);

    setCachedPayload(cacheKey, years, YEAR_OPTIONS_CACHE_TTL_MS);

    return createJsonResponse({ data: { years } });
  } catch {
    return createJsonResponse({
      data: {
        years: [],
        partial: true,
        warning: "Daftar tahun belum dapat dibaca.",
      },
    });
  }
}

export async function proxyBackendRequest(
  request: NextRequest,
  path: string[]
): Promise<NextResponse> {
  let backendUrl: string;
  const isGetLikeRequest = isRetryableMethod(request.method);
  const normalizedQuery: NormalizedProxySearchParams = isGetLikeRequest
    ? normalizeProxySearchParams(request.nextUrl.searchParams)
    : { ok: true, searchParams: request.nextUrl.searchParams };

  if (!normalizedQuery.ok) {
    return normalizedQuery.response;
  }

  if (request.method === "GET") {
    const yearOptionsResponse = await createYearOptionsResponse(path);

    if (yearOptionsResponse) {
      return yearOptionsResponse;
    }

    const aggregatedListResponse = await createAggregatedListResponse(
      path,
      normalizedQuery.searchParams
    );

    if (aggregatedListResponse) {
      return aggregatedListResponse;
    }
  }

  try {
    backendUrl = buildBackendUrl(path, normalizedQuery.searchParams);
  } catch (error) {
    return createJsonErrorResponse(
      error instanceof Error
        ? error.message
        : "Konfigurasi API_URL belum tersedia.",
      503,
      undefined,
      "SERVICE_UNAVAILABLE"
    );
  }

  const requestHeaders = forwardRequestHeaders(request.headers);
  const maxAttempts = isGetLikeRequest
    ? BACKEND_GET_RETRY_ATTEMPTS + 1
    : 1;

  try {
    let backendResponse: Response | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      backendResponse = await fetchBackendOnce(
        request,
        backendUrl,
        requestHeaders
      );

      if (
        attempt < maxAttempts &&
        (await isRetryableBackendResponse(backendResponse))
      ) {
        await sleep(BACKEND_GET_RETRY_DELAY_MS * attempt);
        continue;
      }

      break;
    }

    if (!backendResponse) {
      return createJsonErrorResponse(
        "Layanan sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        502,
        undefined,
        "BAD_GATEWAY"
      );
    }

    if (isInfrastructureErrorResponse(backendResponse)) {
      return createJsonErrorResponse(
        "Layanan sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        502,
        undefined,
        "BAD_GATEWAY"
      );
    }

    if (
      request.method === "GET" &&
      backendResponse.status >= 500 &&
      isSafeListPath(path)
    ) {
      const body = await backendResponse.clone().text().catch(() => "");
      const safeFallback = createSafeListFallbackResponse(
        path,
        normalizedQuery.searchParams,
        TRANSIENT_BACKEND_ERROR_PATTERN.test(body)
          ? "Sebagian data belum dapat dibaca dari backend."
          : "Backend mengembalikan error saat membaca halaman data."
      );

      if (safeFallback) {
        return safeFallback;
      }
    }

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: forwardResponseHeaders(backendResponse.headers),
    });
  } catch (error) {
    if (request.method === "GET" && isSafeListPath(path)) {
      const { page, limit } = getSafeListRequestMeta(
        normalizedQuery.searchParams
      );

      return createEmptyListResponse({
        page,
        limit,
        partial: true,
        warning: "Backend lambat merespons. Data sementara belum dapat dibaca.",
      });
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return createJsonErrorResponse(
        "Waktu tunggu habis. Silakan coba beberapa saat lagi.",
        504,
        undefined,
        "GATEWAY_TIMEOUT"
      );
    }

    return createJsonErrorResponse(
      "Layanan sedang tidak tersedia. Silakan coba beberapa saat lagi.",
      502,
      undefined,
      "BAD_GATEWAY"
    );
  }
}
