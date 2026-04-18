import { NextRequest, NextResponse } from "next/server";

import { createSessionAdminUser } from "@/lib/admin/service";
import {
  REFRESH_COOKIE_NAME,
  createAccessToken,
  createRefreshToken,
  getTokenExpiryTimestampMs,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  verifyToken,
  type AuthUser,
} from "@/lib/auth";
import { refreshExternalBackendSession } from "@/lib/server/auth-strategies";

function clearSessionCookies(response: NextResponse) {
  const accessCookieOptions = getAccessTokenCookieOptions();
  const refreshCookieOptions = getRefreshTokenCookieOptions();

  response.cookies.set(accessCookieOptions.name, "", {
    httpOnly: accessCookieOptions.httpOnly,
    secure: accessCookieOptions.secure,
    sameSite: accessCookieOptions.sameSite,
    path: accessCookieOptions.path,
    maxAge: 0,
  });

  response.cookies.set(refreshCookieOptions.name, "", {
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
    path: refreshCookieOptions.path,
    maxAge: 0,
  });

  return response;
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return clearSessionCookies(
      NextResponse.json(
        { error: "Sesi admin tidak valid atau telah berakhir." },
        { status: 401 }
      )
    );
  }

  const refreshPayload = await verifyToken(refreshToken);
  if (!refreshPayload || refreshPayload.type !== "refresh") {
    return clearSessionCookies(
      NextResponse.json(
        { error: "Sesi admin tidak valid atau telah berakhir." },
        { status: 401 }
      )
    );
  }

  let authenticatedUser: AuthUser;

  if (refreshPayload.backendRefreshToken) {
    const refreshResult = await refreshExternalBackendSession({
      backendRefreshToken: refreshPayload.backendRefreshToken,
      origin: request.nextUrl.origin,
    });

    if (!refreshResult.ok) {
      return clearSessionCookies(
        NextResponse.json(
          { error: refreshResult.error },
          { status: refreshResult.status }
        )
      );
    }

    try {
      const sessionUser = createSessionAdminUser(refreshResult.user);
      authenticatedUser = {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        nip: sessionUser.nip,
        role: sessionUser.role,
        backendAccessToken: refreshResult.backendAccessToken,
        backendRefreshToken:
          refreshResult.backendRefreshToken ??
          refreshPayload.backendRefreshToken,
      };
    } catch (error) {
      return clearSessionCookies(
        NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Akun tidak memiliki akses ke dashboard admin.",
          },
          { status: 403 }
        )
      );
    }
  } else {
    authenticatedUser = {
      id: refreshPayload.userId,
      name: refreshPayload.name,
      email: refreshPayload.email,
      nip: refreshPayload.nip,
      role: refreshPayload.role,
    };
  }

  const [nextAccessToken, nextRefreshToken] = await Promise.all([
    createAccessToken(authenticatedUser),
    createRefreshToken(authenticatedUser),
  ]);
  const nextAccessPayload = await verifyToken(nextAccessToken);

  const response = NextResponse.json({
    success: true,
    expiresIn: "15m",
    accessTokenExpiresAt: getTokenExpiryTimestampMs(nextAccessPayload),
  });
  const accessCookieOptions = getAccessTokenCookieOptions();
  const refreshCookieOptions = getRefreshTokenCookieOptions();

  response.cookies.set(accessCookieOptions.name, nextAccessToken, {
    httpOnly: accessCookieOptions.httpOnly,
    secure: accessCookieOptions.secure,
    sameSite: accessCookieOptions.sameSite,
    path: accessCookieOptions.path,
    maxAge: accessCookieOptions.maxAge,
  });

  response.cookies.set(refreshCookieOptions.name, nextRefreshToken, {
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
    path: refreshCookieOptions.path,
    maxAge: refreshCookieOptions.maxAge,
  });

  return response;
}

export async function GET(request: NextRequest) {
  return POST(request);
}
