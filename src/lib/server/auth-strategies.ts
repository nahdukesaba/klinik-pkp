import "server-only";

import {
  BackendApiError,
  buildBackendApiUrl,
  fetchBackendJson,
  getBackendApiBaseUrl,
} from "@/lib/admin/backend-api";
import type { ApiResponse } from "@/lib/api-client";
import {
  requireAuthenticatedUser,
  type AuthenticatedUser,
  type LoginSource,
} from "@/lib/auth/session-contract";
import { sanitizeEmail, sanitizeNip } from "@/lib/security";
import {
  getKlinikContext,
  loginWithSso,
  refreshSsoSession,
  SsoAuthError,
} from "@/lib/server/sso-auth";

// ---------------------------------------------------------------------------
// Tipe bersama
// ---------------------------------------------------------------------------

export type AuthenticatedBackendUser = AuthenticatedUser;

export type ExternalAuthResult =
  | {
      ok: true;
      user: AuthenticatedBackendUser;
      backendAccessToken: string;
      backendRefreshToken?: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
      details?: Record<string, string | string[]>;
    };

// ---------------------------------------------------------------------------
// Deduplikasi untuk request autentikasi yang identik secara bersamaan.
// ---------------------------------------------------------------------------

const pendingExternalAuth = new Map<string, Promise<ExternalAuthResult>>();

// ---------------------------------------------------------------------------
// Helper internal
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Ambil pesan error dari payload backend, atau berikan fallback sesuai status. */
function extractAuthFailureMessage(payload: unknown, status: number) {
  if (isRecord(payload)) {
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
  }

  if (status === 401 || status === 403 || status === 422) {
    return "Email, NIP, atau password salah.";
  }
  if (status === 404) {
    return "Endpoint autentikasi backend tidak ditemukan. Periksa AUTH_API_URL atau AUTH_API_PATH.";
  }
  if (status === 429) {
    return "Terlalu banyak percobaan. Silakan coba lagi nanti.";
  }
  if (status >= 500) {
    return "Layanan autentikasi sedang mengalami gangguan.";
  }

  return "Autentikasi gagal diproses.";
}

function extractAuthFailureDetails(payload: unknown) {
  if (
    isRecord(payload) &&
    "details" in payload &&
    payload.details &&
    typeof payload.details === "object"
  ) {
    return payload.details as Record<string, string | string[]>;
  }
  return undefined;
}

/** Normalisasi status: 404 dari infrastruktur → 502 (bukan "tidak ditemukan"). */
function normalizeAuthFailureStatus(status: number) {
  return status;
}

function getSetCookieHeaders(response: Response) {
  const headerBag = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headerBag.getSetCookie === "function") {
    return headerBag.getSetCookie();
  }

  const singleHeader = response.headers.get("set-cookie");
  return singleHeader ? [singleHeader] : [];
}

function extractCookieValue(setCookieHeaders: string[], cookieName: string) {
  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escapedName}=([^;]+)`);

  for (const header of setCookieHeaders) {
    const match = header.match(pattern);
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }
  return undefined;
}

function resolveBackendAuthUrls() {
  const configuredAuthUrl = process.env.AUTH_API_URL?.trim();
  if (configuredAuthUrl) {
    return [configuredAuthUrl];
  }

  const authPath = process.env.AUTH_API_PATH?.trim() || "/authentications";
  if (/^https?:\/\//i.test(authPath)) {
    return [authPath];
  }

  try {
    getBackendApiBaseUrl();
  } catch {
    return [];
  }

  return [buildBackendApiUrl(authPath)];
}

/** Ambil profil pengguna yang sudah terautentikasi dari backend. */
async function fetchAuthenticatedBackendUser(
  accessToken: string,
): Promise<AuthenticatedBackendUser> {
  const payload = await fetchBackendJson<ApiResponse<Record<string, unknown>>>(
    "users/me",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeoutMs: 15_000,
    },
  );

  if (!payload.success || !payload.data || typeof payload.data !== "object") {
    throw new BackendApiError(
      "Gagal memuat profil pengguna.",
      502,
      payload.details,
    );
  }

  const data = payload.data as Record<string, unknown>;

  return requireAuthenticatedUser({
    appUserId: data.appUserId,
    authUserId: data.authUserId,
    email: typeof data.email === "string" ? sanitizeEmail(data.email) : "",
    nip: typeof data.nip === "string" ? sanitizeNip(data.nip) : null,
    phone: data.phone,
    fullName:
      typeof data.name === "string" && data.name.trim() !== ""
        ? data.name.trim()
        : "Admin PKP",
    role: data.role,
    status: data.status,
    loginSource: "direct",
    legacyLocalUserId: null,
  });
}

function buildCanonicalUser(
  session: Awaited<ReturnType<typeof loginWithSso>>,
  klinikContext: Awaited<ReturnType<typeof getKlinikContext>>,
  loginSource: LoginSource,
) {
  if (session.user.appUserId !== klinikContext.appUserId) {
    throw new SsoAuthError(
      "Identitas sesi SSO tidak konsisten.",
      403,
      "canonical_identity_mismatch",
    );
  }

  return requireAuthenticatedUser({
    appUserId: klinikContext.appUserId,
    authUserId: klinikContext.authUserId,
    fullName: klinikContext.fullName,
    email: sanitizeEmail(klinikContext.email),
    phone: klinikContext.phone,
    nip: klinikContext.nip ? sanitizeNip(klinikContext.nip) : null,
    role: klinikContext.role,
    status: klinikContext.status,
    loginSource,
    legacyLocalUserId: null,
  });
}

// ---------------------------------------------------------------------------
// Strategi SSO terpusat
// ---------------------------------------------------------------------------

export async function authenticateAgainstCentralSso(input: {
  email: string;
  password: string;
}): Promise<ExternalAuthResult> {
  try {
    const session = await loginWithSso({
      email: sanitizeEmail(input.email),
      password: input.password,
    });

    const klinikContext = await getKlinikContext(session.accessToken);

    return {
      ok: true,
      user: buildCanonicalUser(session, klinikContext, "direct"),
      backendAccessToken: session.accessToken,
      backendRefreshToken: session.refreshToken,
    };
  } catch (error) {
    if (error instanceof SsoAuthError) {
      return {
        ok: false,
        status: error.status,
        error: error.message,
      };
    }

    return {
      ok: false,
      status: 502,
      error: "Layanan autentikasi sedang tidak tersedia.",
    };
  }
}

// ---------------------------------------------------------------------------
// Strategi A: Kredensial admin dari environment variable
// ---------------------------------------------------------------------------

type LocalAuthOutcome =
  | { type: "skip" }
  | { type: "invalid"; status: number; error: string }
  | { type: "success"; result: ExternalAuthResult & { ok: true } };

export function authenticateAgainstLocalAdminEnv(input: {
  email: string;
  nip: string;
  password: string;
}): LocalAuthOutcome {
  const adminEmail = sanitizeEmail(process.env.ADMIN_EMAIL ?? "");
  const adminNip = sanitizeNip(process.env.ADMIN_NIP ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || !adminNip || !adminPassword) {
    return { type: "skip" };
  }

  const matchedIdentity =
    adminEmail.toLowerCase() === input.email.toLowerCase() &&
    adminNip === input.nip;

  if (!matchedIdentity) {
    return { type: "skip" };
  }

  if (adminPassword !== input.password) {
    return {
      type: "invalid",
      status: 401,
      error: "Email, NIP, atau password salah.",
    };
  }

  return {
    type: "invalid",
    status: 503,
    error: "Sesi canonical hanya dapat dibuat melalui Central SSO.",
  };
}

// ---------------------------------------------------------------------------
// Strategi B: Autentikasi ke backend eksternal
// ---------------------------------------------------------------------------

async function authenticateAgainstExternalBackend(
  input: { email: string; nip: string; password: string },
  _origin: string,
): Promise<ExternalAuthResult> {
  const backendAuthUrls = resolveBackendAuthUrls();

  if (!backendAuthUrls.length) {
    return {
      ok: false,
      status: 503,
      error: "Layanan autentikasi belum tersedia.",
    };
  }

  for (const backendAuthUrl of backendAuthUrls) {
    let response: Response;

    try {
      response = await fetch(backendAuthUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          ok: false,
          status: 504,
          error: "Waktu tunggu autentikasi habis. Silakan coba lagi.",
        };
      }
      return {
        ok: false,
        status: 502,
        error: "Layanan autentikasi sedang tidak tersedia.",
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      return {
        ok: false,
        status: normalizeAuthFailureStatus(response.status),
        error: extractAuthFailureMessage(payload, response.status),
        details: extractAuthFailureDetails(payload),
      };
    }

    const backendAccessToken =
      payload?.data?.access_token ??
      payload?.access_token ??
      payload?.data?.token ??
      payload?.token;

    if (
      typeof backendAccessToken !== "string" ||
      backendAccessToken.trim() === ""
    ) {
      return {
        ok: false,
        status: 502,
        error: "Autentikasi berhasil, tetapi sesi tidak dapat dibuat.",
      };
    }

    let backendUser = payload?.data?.user ?? payload?.user ?? null;
    if (!backendUser || typeof backendUser !== "object") {
      try {
        backendUser = await fetchAuthenticatedBackendUser(backendAccessToken);
      } catch (error) {
        return {
          ok: false,
          status:
            error instanceof BackendApiError && error.status >= 500
              ? error.status
              : 502,
          error:
            error instanceof Error
              ? error.message
              : "Gagal memuat profil pengguna setelah login.",
        };
      }
    }

    const refreshToken = extractCookieValue(
      getSetCookieHeaders(response),
      "refresh_token",
    );

    return {
      ok: true,
      user: requireAuthenticatedUser({
        appUserId: backendUser.appUserId,
        authUserId: backendUser.authUserId,
        email:
          typeof backendUser.email === "string"
            ? sanitizeEmail(backendUser.email)
            : input.email,
        nip:
          typeof backendUser.nip === "string"
            ? sanitizeNip(backendUser.nip)
            : sanitizeNip(input.nip),
        phone: backendUser.phone,
        fullName:
          typeof backendUser.fullName === "string"
            ? backendUser.fullName
            : typeof backendUser.full_name === "string"
              ? backendUser.full_name
              : "Admin PKP",
        role: backendUser.role,
        status: backendUser.status,
        loginSource: "direct",
        legacyLocalUserId:
          typeof backendUser.legacyLocalUserId === "string"
            ? backendUser.legacyLocalUserId
            : null,
      }),
      backendAccessToken,
      backendRefreshToken: refreshToken,
    };
  }

  return {
    ok: false,
    status: 502,
    error: "Layanan autentikasi tidak tersedia.",
  };
}

/** Wrapper deduplikasi — mencegah request autentikasi identik secara bersamaan. */
export async function authenticateAgainstExternalBackendDedup(
  input: { email: string; nip: string; password: string },
  origin: string,
): Promise<ExternalAuthResult> {
  const key = `${origin}|${input.email.toLowerCase()}|${input.nip}`;
  const existing = pendingExternalAuth.get(key);
  if (existing) {
    return existing;
  }

  const requestPromise = authenticateAgainstExternalBackend(
    input,
    origin,
  ).finally(() => {
    pendingExternalAuth.delete(key);
  });

  pendingExternalAuth.set(key, requestPromise);
  return requestPromise;
}

export async function refreshExternalBackendSession(params: {
  backendRefreshToken: string;
  origin: string;
  loginSource: LoginSource;
}): Promise<ExternalAuthResult> {
  void params.origin;

  try {
    const session = await refreshSsoSession(params.backendRefreshToken);
    const klinikContext = await getKlinikContext(session.accessToken);

    return {
      ok: true,
      user: buildCanonicalUser(session, klinikContext, params.loginSource),
      backendAccessToken: session.accessToken,
      backendRefreshToken: session.refreshToken,
    };
  } catch (error) {
    if (error instanceof SsoAuthError) {
      return {
        ok: false,
        status: error.status,
        error: error.message,
      };
    }

    return {
      ok: false,
      status: 502,
      error: "Layanan autentikasi sedang tidak tersedia.",
    };
  }
}
