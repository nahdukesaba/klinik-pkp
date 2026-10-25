import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  createAccessToken,
  createRefreshToken,
  getAccessTokenCookieOptions,
  getBackendAccessCookieOptions,
  getBackendRefreshCookieOptions,
  getRefreshTokenCookieOptions,
  verifyToken,
  type AuthUser,
} from "@/lib/auth";
import { isCentralSsoSessionActive } from "@/lib/server/central-sso-session";

export async function getAuthenticatedSessionUserFromCookies(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (payload?.type !== "access") return null;
  return (await isCentralSsoSessionActive(payload)) ? payload : null;
}

export function clearAuthenticatedSessionCookies(response: NextResponse) {
  for (const options of [
    getAccessTokenCookieOptions(),
    getRefreshTokenCookieOptions(),
    getBackendAccessCookieOptions(),
    getBackendRefreshCookieOptions(),
  ]) {
    response.cookies.set(options.name, "", {
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite: options.sameSite,
      path: options.path,
      maxAge: 0,
      priority: options.priority,
    });
  }
  return response;
}

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
