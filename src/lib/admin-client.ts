"use client";

import {
  getApiErrorMessage,
  normalizeApiError,
  type ApiErrorDetails,
} from "@/lib/api-response";
import {
  fetchAdminCsrfToken,
  refreshAdminSessionToken,
} from "@/services/auth-token.service";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export class AdminApiError extends Error {
  status: number;
  code?: string;
  details?: ApiErrorDetails;

  constructor(
    message: string,
    status: number,
    options: {
      code?: string;
      details?: ApiErrorDetails;
    } = {}
  ) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = options.code;
    this.details = options.details;
  }
}

let csrfTokenPromise: Promise<string> | null = null;
let adminSessionRefreshPromise: Promise<boolean> | null = null;

function isCsrfErrorPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const errorMessage = getApiErrorMessage(payload)?.toLowerCase() ?? "";

  return (
    errorMessage.includes("token keamanan") ||
    errorMessage.includes("request tidak valid") ||
    errorMessage.includes("csrf")
  );
}

async function getCsrfToken(forceRefresh = false) {
  if (!forceRefresh && csrfTokenPromise) {
    return csrfTokenPromise;
  }

  csrfTokenPromise = fetchAdminCsrfToken()
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
}

async function refreshAdminSession() {
  if (adminSessionRefreshPromise) {
    return adminSessionRefreshPromise;
  }

  adminSessionRefreshPromise = refreshAdminSessionToken()
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
  details?: ApiErrorDetails
) {
  if (!details) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [
      key,
      Array.isArray(value)
        ? String(value[0] ?? "Input tidak valid.")
        : typeof value === "string"
          ? value
          : "Input tidak valid.",
    ])
  );
}

function redirectToLoginIfUnauthorized(status: number) {
  if (
    status !== 401 ||
    typeof window === "undefined" ||
    window.location.pathname.startsWith("/login")
  ) {
    return;
  }

  window.location.assign("/login");
}

function createAdminApiError(
  status: number,
  payload: unknown,
  fallbackMessage = "Permintaan admin gagal diproses."
) {
  const normalizedError = normalizeApiError(status, payload, fallbackMessage);
  redirectToLoginIfUnauthorized(status);

  return new AdminApiError(normalizedError.message, status, {
    code: normalizedError.code,
    details: normalizedError.details,
  });
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
        throw createAdminApiError(retryResponse.status, retryPayload);
      }

      return retryPayload as T;
    }

    throw createAdminApiError(response.status, payload);
  }

  return payload as T;
}
