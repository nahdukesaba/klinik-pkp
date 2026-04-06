import "server-only";

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

  return `HTTP ${status}`;
}

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

function normalizeApiBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function normalizePathname(pathname: string) {
  return pathname.replace(/^\/+/, "");
}

export function getBackendApiBaseUrl() {
  const apiUrl = process.env.API_URL?.trim();
  if (!apiUrl) {
    throw new Error("Backend API belum dikonfigurasi.");
  }

  return normalizeApiBaseUrl(apiUrl);
}

export function buildBackendApiUrl(pathname: string) {
  const cleanPath = normalizePathname(pathname);
  return `${getBackendApiBaseUrl()}/${cleanPath}`;
}

export function buildBackendProxyUrl(origin: string, pathname: string) {
  const normalizedOrigin = origin.trim().replace(/\/+$/, "");
  const cleanPath = normalizePathname(pathname);
  return `${normalizedOrigin}/api/ext/${cleanPath}`;
}

export function createBackendHeaders(headers?: HeadersInit) {
  return new Headers({
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...headers,
  });
}

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
      error instanceof Error ? error.message : "Backend API belum dikonfigurasi.",
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
      throw new BackendApiError("Permintaan ke backend melebihi batas waktu.", 504);
    }

    throw new BackendApiError("Tidak dapat terhubung ke backend API.", 502);
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
