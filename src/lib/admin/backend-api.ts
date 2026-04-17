import "server-only";

import {
  buildConfiguredBackendApiUrl,
  normalizeBackendApiBaseUrl,
  normalizeBackendPathname,
  requireBackendApiBaseUrl,
} from "@/lib/server/backend-config";

/** Tipe detail error dari backend */
type BackendErrorDetails = Record<string, string | string[]>;

function isBackendErrorDetails(value: unknown): value is BackendErrorDetails {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every((entry) => {
    if (typeof entry === "string") {
      return true;
    }

    return Array.isArray(entry) && entry.every((item) => typeof item === "string");
  });
}

/** Ambil pesan error dari payload response backend. */
function extractBackendMessage(payload: unknown, status: number) {
  if (payload && typeof payload === "object") {
    if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }

    if (
      "message" in payload &&
      typeof payload.message === "string" &&
      payload.message.trim()
    ) {
      return payload.message;
    }
  }

  return `Terjadi kesalahan (HTTP ${status}).`;
}

/** Ambil detail error terstruktur dari payload jika tersedia. */
function extractBackendDetails(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "details" in payload &&
    isBackendErrorDetails(payload.details)
  ) {
    return payload.details;
  }

  return undefined;
}

export class BackendApiError extends Error {
  status: number;
  details?: BackendErrorDetails;

  constructor(message: string, status: number, details?: BackendErrorDetails) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.details = details;
  }
}

/** Ambil base URL backend dari environment variable. */
export function getBackendApiBaseUrl() {
  return requireBackendApiBaseUrl();
}

/** Buat URL langsung ke backend berdasarkan pathname. */
export function buildBackendApiUrl(pathname: string) {
  return buildConfiguredBackendApiUrl(pathname);
}

/** Buat URL proxy melalui Next.js API route. */
export function buildBackendProxyUrl(origin: string, pathname: string) {
  const normalizedOrigin = normalizeBackendApiBaseUrl(origin);
  const cleanPath = normalizeBackendPathname(pathname);
  return `${normalizedOrigin}/api/ext/${cleanPath}`;
}

/** Buat header standar untuk request ke backend. */
export function createBackendHeaders(headers?: HeadersInit) {
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  return requestHeaders;
}

/** Fetch JSON dari backend dengan timeout dan error handling. */
export async function fetchBackendJson<T>(
  pathname: string,
  init: RequestInit & { timeoutMs?: number; origin?: string } = {}
) {
  const { timeoutMs = 20_000, headers, origin, ...requestInit } = init;

  let targetUrl: string;

  try {
    targetUrl = origin
      ? buildBackendProxyUrl(origin, pathname)
      : buildBackendApiUrl(pathname);
  } catch (error) {
    throw new BackendApiError(
      error instanceof Error ? error.message : "Konfigurasi API_URL belum tersedia.",
      503
    );
  }

  let response: Response;

  try {
    response = await fetch(targetUrl, {
      ...requestInit,
      headers: createBackendHeaders(headers),
      signal: AbortSignal.timeout(timeoutMs),
      cache: requestInit.cache ?? "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new BackendApiError("Waktu tunggu ke backend habis.", 504);
    }

    throw new BackendApiError("Layanan backend sedang tidak tersedia.", 502);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new BackendApiError(
      extractBackendMessage(payload, response.status),
      response.status,
      extractBackendDetails(payload)
    );
  }

  return payload as T;
}
