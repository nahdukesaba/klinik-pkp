import { NextRequest } from "next/server";

import { getRequestIpAddress, hasValidCsrfToken } from "@/lib/admin/security";
import { recordSuccessfulLogin } from "@/lib/admin/service";
import { type AuthUser } from "@/lib/auth";
import { resolveAuthenticatedLandingPath } from "@/lib/auth/browser-sso-contract";
import {
  createAuthenticatedSessionUser,
  toPublicAuthenticatedUser,
} from "@/lib/auth/session-contract";
import { attachAuthenticatedSessionCookies } from "@/lib/server/auth-session";
import {
  authenticateAgainstCentralSso,
  type CentralAuthResult,
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
        403,
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
        validation.errors,
      );
    }

    // --- Rate limiting ---
    if (!checkRateLimit(ipAddress, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS)) {
      return createJsonErrorResponse(
        "Terlalu banyak percobaan. Silakan coba lagi nanti.",
        429,
      );
    }

    const credentials = validation.data!;

    // --- Authentication through central SSO ---
    let authResult: CentralAuthResult;

    try {
      authResult = await authenticateAgainstCentralSso({
        email: credentials.email,
        password: credentials.password,
      });
    } catch {
      return createJsonErrorResponse(
        "Layanan autentikasi sedang tidak tersedia.",
        502,
      );
    }

    if (!authResult.ok) {
      const duplicateKeyError =
        /duplicate key value violates unique constraint/i.test(
          authResult.error,
        ) || /authentication_pkey/i.test(authResult.error);

      return createJsonErrorResponse(
        duplicateKeyError
          ? "Permintaan login sedang diproses di backend. Silakan tunggu beberapa detik lalu coba lagi."
          : authResult.error,
        duplicateKeyError ? 409 : authResult.status,
        duplicateKeyError ? undefined : authResult.details,
      );
    }

    // --- Session creation ---
    let authenticatedUser: AuthUser;
    try {
      authenticatedUser = createAuthenticatedSessionUser(authResult.user);
    } catch (error) {
      return createJsonErrorResponse(
        error instanceof Error
          ? error.message
          : "Sesi pengguna tidak valid.",
        403,
      );
    }

    // --- Audit (fire-and-forget) ---
    if (authenticatedUser.role === "admin") {
      try {
        await recordSuccessfulLogin(
          {
            appUserId: authenticatedUser.appUserId,
            fullName: authenticatedUser.fullName,
          },
          ipAddress,
        );
      } catch {
        // Audit tidak boleh menghalangi respons login yang berhasil.
      }
    }

    // --- Response with auth cookies ---
    const response = createJsonResponse({
      success: true,
      user: toPublicAuthenticatedUser(authenticatedUser),
      redirectTo: resolveAuthenticatedLandingPath(authenticatedUser.role),
    });

    return attachAuthenticatedSessionCookies(response, authenticatedUser, {
      accessToken: authResult.backendAccessToken,
      refreshToken: authResult.backendRefreshToken,
    });
  } catch {
    return createJsonErrorResponse(
      "Terjadi kesalahan pada server. Silakan coba lagi.",
      500,
    );
  }
}
