/**
 * Logout API Route
 *
 * POST /api/auth/logout — Hapus token dari httpOnly cookies.
 */

import { NextRequest } from "next/server";

import {
  buildBackendProxyUrl,
  createBackendHeaders,
  getBackendApiBaseUrl,
} from "@/lib/admin/backend-api";
import { CSRF_COOKIE_NAME } from "@/lib/admin/security";
import {
  BACKEND_REFRESH_COOKIE_NAME,
  getBackendAccessCookieOptions,
  getBackendRefreshCookieOptions,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@/lib/auth";
import { createJsonErrorResponse, createJsonResponse } from "@/lib/server/http";
import {
  applySensitiveResponseHeaders,
  hasTrustedSameOrigin,
} from "@/lib/server/web-security";

async function resolveBackendRefreshToken(request: NextRequest) {
  return request.cookies.get(BACKEND_REFRESH_COOKIE_NAME)?.value ?? null;
}

async function terminateBackendSession(request: NextRequest) {
  const backendRefreshToken = await resolveBackendRefreshToken(request);
  if (!backendRefreshToken) {
    return;
  }

  try {
    getBackendApiBaseUrl();
    await fetch(buildBackendProxyUrl(request.nextUrl.origin, "authentications"), {
      method: "DELETE",
      headers: createBackendHeaders({
        Cookie: `refresh_token=${encodeURIComponent(backendRefreshToken)}`,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Logout lokal tetap harus berhasil walau backend sedang tidak aktif.
  }
}

export async function POST(request: NextRequest) {
  if (!hasTrustedSameOrigin(request)) {
    return createJsonErrorResponse("Origin permintaan tidak diizinkan.", 403);
  }

  await terminateBackendSession(request);

  const response = applySensitiveResponseHeaders(
    createJsonResponse({ success: true }),
    { clearSiteData: true }
  );
  const accessTokenCookieOptions = getAccessTokenCookieOptions();
  const refreshTokenCookieOptions = getRefreshTokenCookieOptions();
  const backendAccessCookieOptions = getBackendAccessCookieOptions();
  const backendRefreshCookieOptions = getBackendRefreshCookieOptions();

  response.cookies.set(accessTokenCookieOptions.name, "", {
    httpOnly: accessTokenCookieOptions.httpOnly,
    secure: accessTokenCookieOptions.secure,
    sameSite: accessTokenCookieOptions.sameSite,
    path: accessTokenCookieOptions.path,
    maxAge: 0, // Expire segera
    priority: accessTokenCookieOptions.priority,
  });

  response.cookies.set(refreshTokenCookieOptions.name, "", {
    httpOnly: refreshTokenCookieOptions.httpOnly,
    secure: refreshTokenCookieOptions.secure,
    sameSite: refreshTokenCookieOptions.sameSite,
    path: refreshTokenCookieOptions.path,
    maxAge: 0,
    priority: refreshTokenCookieOptions.priority,
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

  response.cookies.set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    priority: "medium",
  });

  return response;
}
