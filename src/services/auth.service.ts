"use client";

import { adminFetch, ensureAdminCsrfToken } from "@/lib/admin-client";
import { getApiPayloadData } from "@/lib/api-response";
import {
  readContextualLogoutRequired,
  type BrowserSsoCallback,
} from "@/lib/auth/browser-sso-contract";
import { AUTH_ENDPOINTS } from "@/services/auth-endpoints";

export interface LoginAdminSessionValues {
  email: string;
  password: string;
}

export interface LoginAdminSessionResponse {
  success: boolean;
  data?: {
    user?: {
      appUserId?: string;
      fullName?: string;
    };
  };
}

export interface RefreshSessionResult {
  ok: boolean;
  status: number;
  accessTokenExpiresAt?: number;
}

export async function logoutAdminSession() {
  const response = await fetch(AUTH_ENDPOINTS.logout, {
    method: "POST",
    credentials: "include",
  });
  const payload = await response.json().catch(() => null);
  return {
    centralLogoutRequired: readContextualLogoutRequired(payload),
  };
}

export async function exchangeBrowserSsoSession(
  callback: BrowserSsoCallback,
) {
  await ensureAdminCsrfToken(true);
  const payload = await adminFetch<{
    success: true;
    data: {
      status: "authenticated" | "pending";
      redirectTo: string;
      user?: {
        appUserId: string;
        fullName: string;
        email: string;
        role: "admin" | "user";
        status: "approved";
        loginSource: "direct" | "sso";
      };
    };
  }>(
    AUTH_ENDPOINTS.ssoExchange,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(callback),
    },
    { retryOnUnauthorized: false },
  );

  return payload.data;
}

export async function refreshAdminSession(): Promise<RefreshSessionResult> {
  const response = await fetch(AUTH_ENDPOINTS.refresh, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  const data = getApiPayloadData(payload);
  const accessTokenExpiresAt =
    data &&
    typeof data === "object" &&
    "accessTokenExpiresAt" in data &&
    typeof data.accessTokenExpiresAt === "number"
      ? data.accessTokenExpiresAt
      : undefined;

  return {
    ok: response.ok,
    status: response.status,
    accessTokenExpiresAt,
  };
}

export async function submitForgotPasswordRequest(values: { email: string }) {
  const response = await fetch(AUTH_ENDPOINTS.forgotPassword, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  return {
    ok: response.ok,
    status: response.status,
    payload: await response.json().catch(() => null),
  };
}

export async function loginAdminSession(values: LoginAdminSessionValues) {
  await ensureAdminCsrfToken(true);

  return adminFetch<LoginAdminSessionResponse>(AUTH_ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export async function submitResetPasswordRequest(values: {
  tokenHash: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch(AUTH_ENDPOINTS.resetPassword, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokenHash: values.tokenHash,
      password: values.password,
      confirmPassword: values.confirmPassword,
    }),
  });

  return {
    ok: response.ok,
    status: response.status,
    payload: await response.json().catch(() => null),
  };
}
