import { NextRequest, NextResponse } from "next/server";

import {
  BackendApiError,
  buildBackendProxyUrl,
  fetchBackendJson,
  getBackendApiBaseUrl,
} from "@/lib/admin/backend-api";
import { CSRF_COOKIE_NAME, getRequestIpAddress } from "@/lib/admin/security";
import {
  createSessionAdminUser,
  recordSuccessfulLogin,
} from "@/lib/admin/service";
import {
  createAccessToken,
  createRefreshToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  type AuthUser,
} from "@/lib/auth";
import { sanitizeEmail, sanitizeNip } from "@/lib/security";
import {
  createJsonErrorResponse,
  createValidationErrorResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import { loginSchema, validateForm } from "@/lib/validations";
import type { ApiResponse } from "@/types/api";

const loginAttempts = new Map<string, { count: number; resetTime: number }>();

interface AuthenticatedBackendUser {
  id?: string;
  email: string;
  nip: string;
  name: string;
  role: string;
}

type ExternalAuthResult =
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

const pendingExternalAuth = new Map<
  string,
  Promise<ExternalAuthResult>
>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 60_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

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
    return "Endpoint autentikasi backend tidak ditemukan.";
  }

  if (status === 429) {
    return "Server autentikasi backend sedang membatasi permintaan. Silakan coba lagi beberapa saat lagi.";
  }

  if (status >= 500) {
    return "Server autentikasi backend sedang bermasalah.";
  }

  return "Autentikasi ke backend gagal diproses.";
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

function normalizeAuthFailureStatus(status: number) {
  // Route /api/auth/login ada dan valid. Jika endpoint autentikasi upstream
  // tidak ditemukan, itu lebih tepat diperlakukan sebagai gateway failure.
  return status === 404 ? 502 : status;
}

function authenticateAgainstLocalAdminEnv(input: {
  email: string;
  nip: string;
  password: string;
}) {
  const adminEmail = sanitizeEmail(process.env.ADMIN_EMAIL ?? "");
  const adminNip = sanitizeNip(process.env.ADMIN_NIP ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const adminName = process.env.ADMIN_NAME?.trim() || "Administrator Klinik PKP";

  if (!adminEmail || !adminNip || !adminPassword) {
    return { type: "skip" as const };
  }

  const matchedIdentity =
    adminEmail.toLowerCase() === input.email.toLowerCase() &&
    adminNip === input.nip;

  if (!matchedIdentity) {
    return { type: "skip" as const };
  }

  if (adminPassword !== input.password) {
    return {
      type: "invalid" as const,
      status: 401,
      error: "Email, NIP, atau password salah.",
    };
  }

  return {
    type: "success" as const,
    result: {
      ok: true as const,
      user: {
        id: "local-admin",
        email: adminEmail,
        nip: adminNip,
        name: adminName,
        role: "admin",
      },
      backendAccessToken: "",
    },
  };
}

function resolveBackendAuthUrls(origin: string) {
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

  return [buildBackendProxyUrl(origin, authPath)];
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

async function fetchAuthenticatedBackendUser(
  accessToken: string,
  origin: string
): Promise<AuthenticatedBackendUser> {
  const payload = await fetchBackendJson<ApiResponse<Record<string, unknown>>>(
    "users/me",
    {
      origin,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeoutMs: 15_000,
    }
  );

  if (!payload.success || !payload.data || typeof payload.data !== "object") {
    throw new BackendApiError(
      "Profil pengguna backend tidak dapat dibaca.",
      502,
      payload.details
    );
  }

  const data = payload.data as Record<string, unknown>;

  return {
    id: typeof data.id === "string" ? data.id : undefined,
    email:
      typeof data.email === "string" ? sanitizeEmail(data.email) : "",
    nip:
      typeof data.nip === "string" ? sanitizeNip(data.nip) : "",
    name:
      typeof data.name === "string" && data.name.trim() !== ""
        ? data.name.trim()
        : "Admin PKP",
    role: typeof data.role === "string" ? data.role : "user",
  };
}

function cleanupLoginAttempts() {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (now > entry.resetTime) {
      loginAttempts.delete(key);
    }
  }
}

if (typeof globalThis !== "undefined") {
  const cleanupInterval = 5 * 60_000;
  const existing = (globalThis as Record<string, unknown>)
    .__loginRateLimitCleanup as ReturnType<typeof setInterval> | undefined;

  if (!existing) {
    (globalThis as Record<string, unknown>).__loginRateLimitCleanup = setInterval(
      cleanupLoginAttempts,
      cleanupInterval
    );
  }
}

function checkLoginRateLimit(ipAddress: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ipAddress);

  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ipAddress, {
      count: 1,
      resetTime: now + LOGIN_WINDOW_MS,
    });
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_LOGIN_ATTEMPTS;
}

async function authenticateAgainstExternalBackend(input: {
  email: string;
  nip: string;
  password: string;
}, origin: string): Promise<ExternalAuthResult> {
  const backendAuthUrls = resolveBackendAuthUrls(origin);

  if (!backendAuthUrls.length) {
    return {
      ok: false as const,
      status: 503,
      error: "Backend autentikasi belum dikonfigurasi.",
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
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          ok: false as const,
          status: 504,
          error: "Permintaan ke server autentikasi backend melebihi batas waktu.",
        };
      }

      return {
        ok: false as const,
        status: 502,
        error: "Tidak dapat terhubung ke server autentikasi backend.",
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      return {
        ok: false as const,
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
    if (typeof backendAccessToken !== "string" || backendAccessToken.trim() === "") {
      return {
        ok: false as const,
        status: 502,
        error: "Login backend berhasil, tetapi access token tidak dikembalikan.",
      };
    }

    let backendUser = payload?.data?.user ?? payload?.user ?? null;
    if (!backendUser || typeof backendUser !== "object") {
      try {
        backendUser = await fetchAuthenticatedBackendUser(
          backendAccessToken,
          origin
        );
      } catch (error) {
        return {
          ok: false as const,
          status:
            error instanceof BackendApiError && error.status >= 500
              ? error.status
              : 502,
          error:
            error instanceof Error
              ? error.message
              : "Profil pengguna backend tidak dapat dimuat setelah login.",
        };
      }
    }

    const refreshToken = extractCookieValue(
      getSetCookieHeaders(response),
      "refresh_token"
    );

    return {
      ok: true as const,
      user: {
        id:
          typeof backendUser.id === "string" ? backendUser.id : payload?.data?.id,
        email:
          typeof backendUser.email === "string"
            ? sanitizeEmail(backendUser.email)
            : input.email,
        nip:
          typeof backendUser.nip === "string"
            ? sanitizeNip(backendUser.nip)
            : input.nip,
        name:
          typeof backendUser.name === "string"
            ? backendUser.name
            : typeof backendUser.full_name === "string"
              ? backendUser.full_name
              : "Admin PKP",
        role:
          typeof backendUser.role === "string" ? backendUser.role : "user",
      },
      backendAccessToken,
      backendRefreshToken: refreshToken,
    };
  }

  return {
    ok: false as const,
    status: 502,
    error:
      "Endpoint autentikasi backend tidak ditemukan. Default docs proyek memakai POST /api/v1/authentications. Periksa API_URL atau AUTH_API_PATH agar mengarah ke route backend yang benar.",
  };
}

async function authenticateAgainstExternalBackendDedup(input: {
  email: string;
  nip: string;
  password: string;
}, origin: string): Promise<ExternalAuthResult> {
  const key = `${origin}|${input.email.toLowerCase()}|${input.nip}`;
  const existing = pendingExternalAuth.get(key);
  if (existing) {
    return existing;
  }

  const requestPromise = authenticateAgainstExternalBackend(input, origin).finally(() => {
    pendingExternalAuth.delete(key);
  });

  pendingExternalAuth.set(key, requestPromise);
  return requestPromise;
}

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getRequestIpAddress(request);

    const csrfHeader = request.headers.get("x-csrf-token");
    const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    if (
      !csrfHeader ||
      !csrfCookie ||
      csrfHeader.length < 24 ||
      csrfHeader !== csrfCookie
    ) {
      return createJsonErrorResponse(
        "Request tidak valid. Silakan muat ulang halaman login.",
        403
      );
    }

    const body = await readJsonRequestBody<Record<string, unknown>>(request);
    if (!body) {
      return createJsonErrorResponse("Request body tidak valid.", 400);
    }

    const validation = validateForm(loginSchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(
        "Data login tidak valid.",
        validation.errors
      );
    }

    if (!checkLoginRateLimit(ipAddress)) {
      return createJsonErrorResponse(
        "Terlalu banyak percobaan. Silakan coba lagi nanti.",
        429
      );
    }

    const credentials = validation.data;
    if (!credentials) {
      return createJsonErrorResponse("Data login tidak valid.", 400);
    }

    const localAuthResult = authenticateAgainstLocalAdminEnv(credentials);
    if (localAuthResult.type === "invalid") {
      return createJsonErrorResponse(
        localAuthResult.error,
        localAuthResult.status
      );
    }

    let externalAuthResult: ExternalAuthResult;

    if (localAuthResult.type === "success") {
      externalAuthResult = localAuthResult.result;
    } else {
      try {
        externalAuthResult = await authenticateAgainstExternalBackendDedup(
          credentials,
          request.nextUrl.origin
        );
      } catch {
        return createJsonErrorResponse(
          "Tidak dapat terhubung ke server autentikasi.",
          502
        );
      }
    }

    if (!externalAuthResult.ok) {
      const duplicateKeyError =
        /duplicate key value violates unique constraint/i.test(
          externalAuthResult.error
        ) ||
        /authentication_pkey/i.test(externalAuthResult.error);

      return createJsonErrorResponse(
        duplicateKeyError
          ? "Permintaan login sedang diproses di backend. Silakan tunggu beberapa detik lalu coba lagi."
          : externalAuthResult.error,
        duplicateKeyError ? 409 : externalAuthResult.status,
        duplicateKeyError ? undefined : externalAuthResult.details
      );
    }

    let authenticatedUser: AuthUser;

    try {
      const sessionUser = createSessionAdminUser(externalAuthResult.user);
      authenticatedUser = {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        nip: sessionUser.nip,
        role: sessionUser.role,
        backendAccessToken: externalAuthResult.backendAccessToken,
        backendRefreshToken: externalAuthResult.backendRefreshToken,
      };
    } catch (error) {
      return createJsonErrorResponse(
        error instanceof Error
          ? error.message
          : "Akun tidak memiliki akses ke dashboard admin.",
        403
      );
    }

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(authenticatedUser),
      createRefreshToken(authenticatedUser),
    ]);

    try {
      await recordSuccessfulLogin(
        { id: authenticatedUser.id, name: authenticatedUser.name },
        ipAddress
      );
    } catch {
      // Login utama sudah berhasil. Kegagalan pencatatan audit/login
      // tidak perlu mengubah respons sukses ke client.
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
      },
    });

    const accessOpts = getAccessTokenCookieOptions();
    response.cookies.set(accessOpts.name, accessToken, {
      httpOnly: accessOpts.httpOnly,
      secure: accessOpts.secure,
      sameSite: accessOpts.sameSite,
      path: accessOpts.path,
      maxAge: accessOpts.maxAge,
    });

    const refreshOpts = getRefreshTokenCookieOptions();
    response.cookies.set(refreshOpts.name, refreshToken, {
      httpOnly: refreshOpts.httpOnly,
      secure: refreshOpts.secure,
      sameSite: refreshOpts.sameSite,
      path: refreshOpts.path,
      maxAge: refreshOpts.maxAge,
    });

    return response;
  } catch {
    return createJsonErrorResponse(
      "Terjadi kesalahan. Silakan coba lagi.",
      500
    );
  }
}
