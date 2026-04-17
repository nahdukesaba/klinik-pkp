import { NextRequest, NextResponse } from "next/server";

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
import {
  authenticateAgainstExternalBackendDedup,
  authenticateAgainstLocalAdminEnv,
  type ExternalAuthResult,
} from "@/lib/server/auth-strategies";
import {
  createJsonErrorResponse,
  createValidationErrorResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { loginSchema, validateForm } from "@/lib/validations";

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getRequestIpAddress(request);

    // --- CSRF verification ---
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
        backendAccessToken: authResult.backendAccessToken,
        backendRefreshToken: authResult.backendRefreshToken,
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
      "Terjadi kesalahan pada server. Silakan coba lagi.",
      500
    );
  }
}
