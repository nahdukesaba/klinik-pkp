import "server-only";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";
import type { UserRole } from "@/types/admin";

import {
  canManageContent,
  canManageUsers,
  isAdminPanelRole,
  normalizeAdminRole,
} from "./roles";

export const CSRF_COOKIE_NAME = "klinik-pkp-csrf";

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  nip: string;
  role: UserRole;
  backendAccessToken?: string;
  backendRefreshToken?: string;
}

export {
  canManageContent,
  canManageUsers,
  isAdminPanelRole,
  normalizeAdminRole,
};

function mapPayloadToSessionUser(payload: {
  userId: string;
  name: string;
  email: string;
  nip: string;
  role: string;
  backendAccessToken?: string;
  backendRefreshToken?: string;
}) {
  if (!isAdminPanelRole(payload.role)) {
    return null;
  }

  return {
    id: payload.userId,
    name: payload.name,
    email: payload.email,
    nip: payload.nip,
    role: payload.role,
    backendAccessToken: payload.backendAccessToken,
    backendRefreshToken: payload.backendRefreshToken,
  } satisfies AdminSessionUser;
}

export async function getSessionUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload || payload.type !== "access") {
    return null;
  }

  return mapPayloadToSessionUser(payload);
}

export async function getSessionUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload || payload.type !== "access") {
    return null;
  }

  return mapPayloadToSessionUser(payload);
}

export function createCsrfToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

export function attachCsrfCookie(response: NextResponse, token: string) {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}

export function hasValidCsrfToken(request: NextRequest) {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  return Boolean(
    headerToken &&
      cookieToken &&
      headerToken.length >= 24 &&
      headerToken === cookieToken
  );
}

export function getRequestIpAddress(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

interface AuthorizeOptions {
  requireCsrf?: boolean;
  roles?: UserRole[];
}

type AuthorizedResult =
  | { ok: true; user: AdminSessionUser }
  | { ok: false; response: NextResponse };

export async function authorizeAdminRequest(
  request: NextRequest,
  options: AuthorizeOptions = {}
): Promise<AuthorizedResult> {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sesi admin tidak valid atau telah berakhir." },
        { status: 401 }
      ),
    };
  }

  if (options.roles && !options.roles.includes(user.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Anda tidak memiliki izin untuk melakukan aksi ini." },
        { status: 403 }
      ),
    };
  }

  if (options.requireCsrf && !hasValidCsrfToken(request)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Token keamanan tidak valid. Silakan muat ulang halaman." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}
