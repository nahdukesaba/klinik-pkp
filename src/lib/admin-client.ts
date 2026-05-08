"use client";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export class AdminApiError extends Error {
  status: number;
  details?: Record<string, string | string[]>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string | string[]>
  ) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.details = details;
  }
}

let csrfTokenPromise: Promise<string> | null = null;
let adminSessionRefreshPromise: Promise<boolean> | null = null;

function isCsrfErrorPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const nestedError =
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
      ? payload.error.message.toLowerCase()
      : "";
  const errorMessage =
    "error" in payload && typeof payload.error === "string"
      ? payload.error.toLowerCase()
      : "";

  return (
    nestedError.includes("token keamanan") ||
    nestedError.includes("request tidak valid") ||
    nestedError.includes("csrf") ||
    errorMessage.includes("token keamanan") ||
    errorMessage.includes("request tidak valid") ||
    errorMessage.includes("csrf")
  );
}

function getApiPayloadData(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success?: unknown }).success === true &&
    "data" in payload
  ) {
    return (payload as { data?: unknown }).data;
  }

  return payload;
}

function getApiErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const error = (payload as { error?: unknown }).error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : undefined;
}

function getApiErrorDetails(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const error = (payload as { error?: unknown }).error;
  if (
    error &&
    typeof error === "object" &&
    "details" in error &&
    error.details &&
    typeof error.details === "object"
  ) {
    return error.details as Record<string, string | string[]>;
  }

  const details = (payload as { details?: unknown }).details;
  return details && typeof details === "object"
    ? (details as Record<string, string | string[]>)
    : undefined;
}

async function getCsrfToken(forceRefresh = false) {
  if (!forceRefresh && csrfTokenPromise) {
    return csrfTokenPromise;
  }

  csrfTokenPromise = fetch("/api/auth/csrf", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => null);
      const data = getApiPayloadData(payload);
      const csrfToken =
        data && typeof data === "object" && "csrfToken" in data
          ? (data as { csrfToken?: unknown }).csrfToken
          : undefined;

      if (!response.ok || typeof csrfToken !== "string") {
        throw new Error("Gagal memuat token keamanan.");
      }

      return csrfToken;
    })
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
}

async function refreshAdminSession() {
  if (adminSessionRefreshPromise) {
    return adminSessionRefreshPromise;
  }

  adminSessionRefreshPromise = fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      adminSessionRefreshPromise = null;
    });

  return adminSessionRefreshPromise;
}

export function warmUpAdminCsrfToken() {
  void getCsrfToken();
}

export async function ensureAdminCsrfToken(forceRefresh = false) {
  return getCsrfToken(forceRefresh);
}

export function normalizeAdminFieldErrors(
  details?: Record<string, string | string[]>
) {
  if (!details) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] ?? "Input tidak valid." : value,
    ])
  );
}

export async function adminFetch<T>(
  input: string,
  init: RequestInit = {},
  options: {
    retryOnForbidden?: boolean;
    retryOnUnauthorized?: boolean;
  } = {}
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  const retryOnForbidden = options.retryOnForbidden ?? true;
  const retryOnUnauthorized = options.retryOnUnauthorized ?? true;

  if (!SAFE_METHODS.has(method)) {
    headers.set("X-CSRF-Token", await getCsrfToken());
  }

  const response = await fetch(input, {
    ...init,
    method,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && retryOnUnauthorized) {
      const refreshed = await refreshAdminSession();

      if (refreshed) {
        return adminFetch<T>(
          input,
          init,
          {
            ...options,
            retryOnUnauthorized: false,
          }
        );
      }
    }

    if (
      !SAFE_METHODS.has(method) &&
      response.status === 403 &&
      retryOnForbidden &&
      isCsrfErrorPayload(payload)
    ) {
      headers.set("X-CSRF-Token", await getCsrfToken(true));

      const retryResponse = await fetch(input, {
        ...init,
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
      const retryPayload = await retryResponse.json().catch(() => null);

      if (!retryResponse.ok) {
        throw new AdminApiError(
          getApiErrorMessage(retryPayload) ?? "Permintaan admin gagal diproses.",
          retryResponse.status,
          getApiErrorDetails(retryPayload)
        );
      }

      return retryPayload as T;
    }

    throw new AdminApiError(
      getApiErrorMessage(payload) ?? "Permintaan admin gagal diproses.",
      response.status,
      getApiErrorDetails(payload)
    );
  }

  return payload as T;
}
