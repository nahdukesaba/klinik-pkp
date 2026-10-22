import "server-only";

import type { NextResponse } from "next/server";

import {
  createAccessToken,
  createRefreshToken,
  getAccessTokenCookieOptions,
  getBackendAccessCookieOptions,
  getBackendRefreshCookieOptions,
  getRefreshTokenCookieOptions,
  type AuthUser,
} from "@/lib/auth";

export async function attachAuthenticatedSessionCookies(
  response: NextResponse,
  user: AuthUser,
  backendSession: {
    accessToken: string;
    refreshToken?: string;
  },
) {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(user),
    createRefreshToken(user),
  ]);
  const accessOptions = getAccessTokenCookieOptions();
  const refreshOptions = getRefreshTokenCookieOptions();
  const backendAccessOptions = getBackendAccessCookieOptions();
  const backendRefreshOptions = getBackendRefreshCookieOptions();

  response.cookies.set(accessOptions.name, accessToken, {
    httpOnly: accessOptions.httpOnly,
    secure: accessOptions.secure,
    sameSite: accessOptions.sameSite,
    path: accessOptions.path,
    maxAge: accessOptions.maxAge,
    priority: accessOptions.priority,
  });
  response.cookies.set(refreshOptions.name, refreshToken, {
    httpOnly: refreshOptions.httpOnly,
    secure: refreshOptions.secure,
    sameSite: refreshOptions.sameSite,
    path: refreshOptions.path,
    maxAge: refreshOptions.maxAge,
    priority: refreshOptions.priority,
  });
  response.cookies.set(backendAccessOptions.name, backendSession.accessToken, {
    httpOnly: backendAccessOptions.httpOnly,
    secure: backendAccessOptions.secure,
    sameSite: backendAccessOptions.sameSite,
    path: backendAccessOptions.path,
    maxAge: backendAccessOptions.maxAge,
    priority: backendAccessOptions.priority,
  });
  response.cookies.set(
    backendRefreshOptions.name,
    backendSession.refreshToken ?? "",
    {
      httpOnly: backendRefreshOptions.httpOnly,
      secure: backendRefreshOptions.secure,
      sameSite: backendRefreshOptions.sameSite,
      path: backendRefreshOptions.path,
      maxAge: backendSession.refreshToken
        ? backendRefreshOptions.maxAge
        : 0,
      priority: backendRefreshOptions.priority,
    },
  );

  return response;
}
