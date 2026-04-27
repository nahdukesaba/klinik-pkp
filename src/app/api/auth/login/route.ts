import { NextRequest } from "next/server";

import {
  getRequestIpAddress,
  hasValidCsrfToken,
} from "@/lib/admin/security";
import {
  createSessionAdminUser,
  recordSuccessfulLogin,
} from "@/lib/admin/service";
import {
  getBackendAccessCookieOptions,
  getBackendRefreshCookieOptions,
  createAccessToken,
  createRefreshToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  type AuthUser,
} from "@/lib/auth";
import {
  authenticateAgainstExternalBackendDedup,
  authenticateAgainstLocalAdminEnv,
  type ExternalAuthResult,
} from "@/lib/server/auth-strategies";
import {
  createJsonResponse,
  createJsonErrorResponse,
  createValidationErrorResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { hasTrustedSameOrigin } from "@/lib/server/web-security";
import { loginSchema, validateForm } from "@/lib/validations";

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 60_000;

function attachBackendSessionCookies(
  response: Response & {
    cookies: {
      set: (
        name: string,
        value: string,
        options: {
          httpOnly: boolean;
          secure: boolean;
          sameSite: "lax" | "strict";
          path: string;
          maxAge: number;
          priority: "high";
        }
      ) => void;
    };
  },
  authResult: Extract<ExternalAuthResult, { ok: true }>
) {
  const backendAccessCookie = getBackendAccessCookieOptions();
  response.cookies.set(
    backendAccessCookie.name,
    authResult.backendAccessToken ?? "",
    {
      httpOnly: backendAccessCookie.httpOnly,
      secure: backendAccessCookie.secure,
      sameSite: backendAccessCookie.sameSite,
      path: backendAccessCookie.path,
      maxAge: authResult.backendAccessToken
        ? backendAccessCookie.maxAge
        : 0,
      priority: backendAccessCookie.priority,
    }
  );

  const backendRefreshCookie = getBackendRefreshCookieOptions();
  response.cookies.set(
    backendRefreshCookie.name,
    authResult.backendRefreshToken ?? "",
    {
      httpOnly: backendRefreshCookie.httpOnly,
      secure: backendRefreshCookie.secure,
      sameSite: backendRefreshCookie.sameSite,
      path: backendRefreshCookie.path,
      maxAge: authResult.backendRefreshToken
        ? backendRefreshCookie.maxAge
        : 0,
      priority: backendRefreshCookie.priority,
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getRequestIpAddress(request);

    if (!hasTrustedSameOrigin(request)) {
      return createJsonErrorResponse("Origin permintaan tidak diizinkan.", 403);
    }

    // --- CSRF verification ---
    if (!hasValidCsrfToken(request)) {
      return createJsonErrorResponse(
        "Request tidak valid. Silakan muat ulang halaman login.",
        403
      );
    }

    // --- Request body parsing & validation ---
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

    // --- Rate limiting ---
    if (!checkRateLimit(ipAddress, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS)) {
      return createJsonErrorResponse(
        "Terlalu banyak percobaan. Silakan coba lagi nanti.",
        429
      );
    }

    const credentials = validation.data!;

    // --- Authentication (local env → external backend fallback) ---
    const localResult = authenticateAgainstLocalAdminEnv(credentials);
    if (localResult.type === "invalid") {
      return createJsonErrorResponse(localResult.error, localResult.status);
    }

    let authResult: ExternalAuthResult;
    if (localResult.type === "success") {
      authResult = localResult.result;
    } else {
      try {
        authResult = await authenticateAgainstExternalBackendDedup(
          credentials,
          request.nextUrl.origin
        );
      } catch {
        return createJsonErrorResponse(
          "Layanan autentikasi sedang tidak tersedia.",
          502
        );
      }
    }

    if (!authResult.ok) {
      const duplicateKeyError =
        /duplicate key value violates unique constraint/i.test(
          authResult.error
        ) || /authentication_pkey/i.test(authResult.error);

      return createJsonErrorResponse(
        duplicateKeyError
          ? "Permintaan login sedang diproses di backend. Silakan tunggu beberapa detik lalu coba lagi."
          : authResult.error,
        duplicateKeyError ? 409 : authResult.status,
        duplicateKeyError ? undefined : authResult.details
      );
    }

    // --- Session creation ---
    let authenticatedUser: AuthUser;
    try {
      const sessionUser = createSessionAdminUser(authResult.user);
      authenticatedUser = {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        nip: sessionUser.nip,
        role: sessionUser.role,
      };
    } catch (error) {
      return createJsonErrorResponse(
        error instanceof Error
          ? error.message
          : "Akun tidak memiliki akses ke dashboard admin.",
        403
      );
    }

    // --- JWT token creation ---
    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(authenticatedUser),
      createRefreshToken(authenticatedUser),
    ]);

    // --- Audit (fire-and-forget) ---
    try {
      await recordSuccessfulLogin(
        { id: authenticatedUser.id, name: authenticatedUser.name },
        ipAddress
      );
    } catch {
      // Audit tidak boleh menghalangi respons login yang berhasil.
    }

    // --- Response with auth cookies ---
    const response = createJsonResponse({
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
      priority: accessOpts.priority,
    });

    const refreshOpts = getRefreshTokenCookieOptions();
    response.cookies.set(refreshOpts.name, refreshToken, {
      httpOnly: refreshOpts.httpOnly,
      secure: refreshOpts.secure,
      sameSite: refreshOpts.sameSite,
      path: refreshOpts.path,
      maxAge: refreshOpts.maxAge,
      priority: refreshOpts.priority,
    });

    attachBackendSessionCookies(response, authResult);

    return response;
  } catch {
    return createJsonErrorResponse(
      "Terjadi kesalahan pada server. Silakan coba lagi.",
      500
    );
  }
}
