/**
 * Logout API Route
 *
 * POST /api/auth/logout — Hapus token dari httpOnly cookies.
 */

import { NextRequest, NextResponse } from "next/server";

import {
  buildBackendProxyUrl,
  createBackendHeaders,
  getBackendApiBaseUrl,
} from "@/lib/admin/backend-api";
import { CSRF_COOKIE_NAME } from "@/lib/admin/security";
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  verifyToken,
} from "@/lib/auth";

async function resolveBackendRefreshToken(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (refreshToken) {
    const payload = await verifyToken(refreshToken);
    if (payload?.backendRefreshToken) {
      return payload.backendRefreshToken;
    }
  }

  if (accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload?.backendRefreshToken) {
      return payload.backendRefreshToken;
    }
  }

  return null;
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
  await terminateBackendSession(request);

  const response = NextResponse.json({ success: true });
  const accessTokenCookieOptions = getAccessTokenCookieOptions();
  const refreshTokenCookieOptions = getRefreshTokenCookieOptions();

  response.cookies.set(accessTokenCookieOptions.name, "", {
    httpOnly: accessTokenCookieOptions.httpOnly,
    secure: accessTokenCookieOptions.secure,
    sameSite: accessTokenCookieOptions.sameSite,
    path: accessTokenCookieOptions.path,
    maxAge: 0, // Expire segera
  });

  response.cookies.set(refreshTokenCookieOptions.name, "", {
    httpOnly: refreshTokenCookieOptions.httpOnly,
    secure: refreshTokenCookieOptions.secure,
    sameSite: refreshTokenCookieOptions.sameSite,
    path: refreshTokenCookieOptions.path,
    maxAge: 0,
  });

  response.cookies.set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
