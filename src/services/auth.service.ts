"use client";

import { adminFetch, ensureAdminCsrfToken } from "@/lib/admin-client";
import { getApiPayloadData } from "@/lib/api-response";
import { AUTH_ENDPOINTS } from "@/services/auth-endpoints";

export interface LoginAdminSessionValues {
  email: string;
  nip: string;
  password: string;
}

export interface LoginAdminSessionResponse {
  success: boolean;
  data?: {
    user?: {
      name?: string;
    };
  };
}

export interface RefreshSessionResult {
  ok: boolean;
  status: number;
  accessTokenExpiresAt?: number;
}

export async function logoutAdminSession() {
  await fetch(AUTH_ENDPOINTS.logout, {
    method: "POST",
    credentials: "include",
  });
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

export async function submitForgotPasswordRequest(values: {
  email: string;
  nip: string;
}) {
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
