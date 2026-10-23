import { NextRequest, type NextResponse } from "next/server";

import { createSessionAdminUser } from "@/lib/admin/service";
import {
  BACKEND_REFRESH_COOKIE_NAME,
  getBackendAccessCookieOptions,
  getBackendRefreshCookieOptions,
  REFRESH_COOKIE_NAME,
  createAccessToken,
  createRefreshToken,
  getTokenExpiryTimestampMs,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  verifyToken,
  type AuthUser,
} from "@/lib/auth";
import {
  refreshExternalBackendSession,
  type ExternalAuthResult,
} from "@/lib/server/auth-strategies";
import {
  createJsonErrorResponse,
  createJsonResponse,
} from "@/lib/server/http";
import { hasTrustedSameOrigin } from "@/lib/server/web-security";

function clearSessionCookies(response: NextResponse) {
  const accessCookieOptions = getAccessTokenCookieOptions();
  const refreshCookieOptions = getRefreshTokenCookieOptions();
  const backendAccessCookieOptions = getBackendAccessCookieOptions();
  const backendRefreshCookieOptions = getBackendRefreshCookieOptions();

  response.cookies.set(accessCookieOptions.name, "", {
    httpOnly: accessCookieOptions.httpOnly,
    secure: accessCookieOptions.secure,
    sameSite: accessCookieOptions.sameSite,
    path: accessCookieOptions.path,
    maxAge: 0,
    priority: accessCookieOptions.priority,
  });

  response.cookies.set(refreshCookieOptions.name, "", {
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
    path: refreshCookieOptions.path,
    maxAge: 0,
    priority: refreshCookieOptions.priority,
  });

  response.cookies.set(backendAccessCookieOptions.name, "", {
    httpOnly: backendAccessCookieOptions.httpOnly,
    secure: backendAccessCookieOptions.secure,
    sameSite: backendAccessCookieOptions.sameSite,
    path: backendAccessCookieOptions.path,
    maxAge: 0,
    priority: backendAccessCookieOptions.priority,
  });

  response.cookies.set(backendRefreshCookieOptions.name, "", {
    httpOnly: backendRefreshCookieOptions.httpOnly,
    secure: backendRefreshCookieOptions.secure,
    sameSite: backendRefreshCookieOptions.sameSite,
    path: backendRefreshCookieOptions.path,
    maxAge: 0,
    priority: backendRefreshCookieOptions.priority,
  });

  return response;
}

export async function POST(request: NextRequest) {
  if (!hasTrustedSameOrigin(request)) {
    return createJsonErrorResponse("Origin permintaan tidak diizinkan.", 403);
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return clearSessionCookies(
      createJsonErrorResponse("Sesi admin tidak valid atau telah berakhir.", 401)
    );
  }

  const refreshPayload = await verifyToken(refreshToken);
  if (!refreshPayload || refreshPayload.type !== "refresh") {
    return clearSessionCookies(
      createJsonErrorResponse("Sesi admin tidak valid atau telah berakhir.", 401)
    );
  }

  let authenticatedUser: AuthUser;
  const backendRefreshToken =
    request.cookies.get(BACKEND_REFRESH_COOKIE_NAME)?.value;
  if (!backendRefreshToken) {
    return clearSessionCookies(
      createJsonErrorResponse(
        "Sesi backend tidak tersedia. Silakan login ulang.",
        401,
      ),
    );
  }

  const refreshResult: ExternalAuthResult =
    await refreshExternalBackendSession({
      backendRefreshToken,
      origin: request.nextUrl.origin,
      loginSource: refreshPayload.loginSource,
    });

  if (!refreshResult.ok) {
    return clearSessionCookies(
      createJsonErrorResponse(refreshResult.error, refreshResult.status),
    );
  }

  try {
    authenticatedUser = createSessionAdminUser(refreshResult.user);
  } catch (error) {
    return clearSessionCookies(
      createJsonErrorResponse(
        error instanceof Error
          ? error.message
          : "Akun tidak memiliki akses ke dashboard admin.",
        403,
      ),
    );
  }

  const [nextAccessToken, nextRefreshToken] = await Promise.all([
    createAccessToken(authenticatedUser),
    createRefreshToken(authenticatedUser),
  ]);
  const nextAccessPayload = await verifyToken(nextAccessToken);

  const response = createJsonResponse({
    success: true,
    expiresIn: "15m",
    accessTokenExpiresAt: getTokenExpiryTimestampMs(nextAccessPayload),
  });
  const accessCookieOptions = getAccessTokenCookieOptions();
  const refreshCookieOptions = getRefreshTokenCookieOptions();
  const backendAccessCookieOptions = getBackendAccessCookieOptions();
  const backendRefreshCookieOptions = getBackendRefreshCookieOptions();

  response.cookies.set(accessCookieOptions.name, nextAccessToken, {
    httpOnly: accessCookieOptions.httpOnly,
    secure: accessCookieOptions.secure,
    sameSite: accessCookieOptions.sameSite,
    path: accessCookieOptions.path,
    maxAge: accessCookieOptions.maxAge,
    priority: accessCookieOptions.priority,
  });

  response.cookies.set(refreshCookieOptions.name, nextRefreshToken, {
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
    path: refreshCookieOptions.path,
    maxAge: refreshCookieOptions.maxAge,
    priority: refreshCookieOptions.priority,
  });

  response.cookies.set(
    backendAccessCookieOptions.name,
    refreshResult.backendAccessToken,
    {
      httpOnly: backendAccessCookieOptions.httpOnly,
      secure: backendAccessCookieOptions.secure,
      sameSite: backendAccessCookieOptions.sameSite,
      path: backendAccessCookieOptions.path,
      maxAge: backendAccessCookieOptions.maxAge,
      priority: backendAccessCookieOptions.priority,
    },
  );

  response.cookies.set(
    backendRefreshCookieOptions.name,
    refreshResult.backendRefreshToken ?? backendRefreshToken,
    {
      httpOnly: backendRefreshCookieOptions.httpOnly,
      secure: backendRefreshCookieOptions.secure,
      sameSite: backendRefreshCookieOptions.sameSite,
      path: backendRefreshCookieOptions.path,
      maxAge: backendRefreshCookieOptions.maxAge,
      priority: backendRefreshCookieOptions.priority,
    },
  );

  return response;
}
