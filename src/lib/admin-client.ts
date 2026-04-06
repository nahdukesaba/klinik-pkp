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

let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

function isCsrfErrorPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const errorMessage =
    "error" in payload && typeof payload.error === "string"
      ? payload.error.toLowerCase()
      : "";

  return (
    errorMessage.includes("token keamanan") ||
    errorMessage.includes("request tidak valid") ||
    errorMessage.includes("csrf")
  );
}

async function getCsrfToken(forceRefresh = false) {
  if (!forceRefresh && csrfTokenCache) {
    return csrfTokenCache;
  }

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
      if (!response.ok || !payload?.csrfToken) {
        throw new Error("Gagal memuat token keamanan.");
      }

      csrfTokenCache = payload.csrfToken as string;
      return csrfTokenCache;
    })
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
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
  } = {}
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  const retryOnForbidden = options.retryOnForbidden ?? true;

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
          retryPayload?.error ??
            retryPayload?.message ??
            "Permintaan admin gagal diproses.",
          retryResponse.status,
          retryPayload?.details
        );
      }

      return retryPayload as T;
    }

    throw new AdminApiError(
      payload?.error ?? payload?.message ?? "Permintaan admin gagal diproses.",
      response.status,
      payload?.details
    );
  }

  return payload as T;
}
