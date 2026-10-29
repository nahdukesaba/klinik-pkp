import "server-only";

import {
  buildBrowserSsoExchangePayload,
  type BrowserSsoCallback,
} from "@/lib/auth/browser-sso-contract";
import {
  requireAuthenticatedUser,
  type AuthenticatedUser,
} from "@/lib/auth/session-contract";
import { buildConfiguredBackendApiUrl } from "@/lib/server/backend-config";

export type KlinikBrowserSsoUser = AuthenticatedUser;

export type KlinikBrowserSsoExchange =
  | { status: "pending" }
  | {
      status: "authenticated";
      accessToken: string;
      refreshToken: string;
      sid: string;
      user: KlinikBrowserSsoUser;
    };

export class KlinikBrowserSsoError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "KlinikBrowserSsoError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json().catch(() => null);
}

function unwrapBackendData(payload: unknown) {
  return isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
}

function backendError(payload: unknown, status: number) {
  const message =
    isRecord(payload) && typeof payload.message === "string"
      ? payload.message
      : "Proses masuk dengan Akun Balai gagal.";
  const code =
    isRecord(payload) && typeof payload.error === "string"
      ? payload.error
      : undefined;
  return new KlinikBrowserSsoError(message, status, code);
}

export function getKlinikBrowserSsoStartUrl() {
  return buildConfiguredBackendApiUrl("auth/sso/start");
}

export function getKlinikBrowserSsoLogoutUrl(cancelReturn?: string) {
  const base = buildConfiguredBackendApiUrl("auth/sso/logout");
  if (
    cancelReturn &&
    cancelReturn.startsWith("/") &&
    !cancelReturn.startsWith("//") &&
    !cancelReturn.startsWith("/\\") &&
    !cancelReturn.includes("\\") &&
    !cancelReturn.includes("#")
  ) {
    const parsed = new URL(base);
    parsed.searchParams.set("cancel_return", cancelReturn);
    return parsed.toString();
  }
  return base;
}

export async function exchangeKlinikBrowserSso(
  callback: BrowserSsoCallback,
): Promise<KlinikBrowserSsoExchange> {
  let response: Response;
  try {
    response = await fetch(buildConfiguredBackendApiUrl("auth/sso/exchange"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildBrowserSsoExchangePayload(callback)),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new KlinikBrowserSsoError(
      "Layanan masuk dengan Akun Balai sedang tidak tersedia.",
      502,
      "SSO_UNAVAILABLE",
    );
  }

  const payload = await readJson(response);
  if (!response.ok) {
    throw backendError(payload, response.status);
  }

  const data = unwrapBackendData(payload);
  if (isRecord(data) && data.status === "pending") {
    return { status: "pending" };
  }
  if (
    !isRecord(data) ||
    data.status !== "authenticated" ||
    typeof data.accessToken !== "string" ||
    typeof data.refreshToken !== "string" ||
    typeof data.sid !== "string" ||
    !data.sid.trim() ||
    !isRecord(data.user) ||
    typeof data.user.id !== "string" ||
    typeof data.user.appUserId !== "string" ||
    data.user.id !== data.user.appUserId ||
    typeof data.user.name !== "string" ||
    typeof data.user.email !== "string" ||
    (data.user.role !== "admin" && data.user.role !== "user") ||
    data.user.status !== "approved"
  ) {
    throw new KlinikBrowserSsoError(
      "Respons autentikasi Klinik PKP tidak valid.",
      502,
      "INVALID_SSO_RESPONSE",
    );
  }

  return {
    status: "authenticated",
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    sid: data.sid,
    user: requireAuthenticatedUser({
      appUserId: data.user.appUserId,
      authUserId: data.user.authUserId,
      fullName: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      nip: data.user.nip,
      role: data.user.role,
      status: data.user.status,
      loginSource: "sso",
      ssoSessionId: data.sid,
    }),
  };
}

export async function logoutKlinikSession(accessToken: string) {
  let response: Response;
  try {
    response = await fetch(buildConfiguredBackendApiUrl("authentications/"), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new KlinikBrowserSsoError(
      "Logout Klinik PKP tidak dapat dikonfirmasi.",
      502,
      "LOGOUT_UNAVAILABLE",
    );
  }

  const payload = await readJson(response);
  if (!response.ok) {
    throw backendError(payload, response.status);
  }
  const data = unwrapBackendData(payload);
  if (!isRecord(data) || typeof data.centralLogoutRequired !== "boolean") {
    throw new KlinikBrowserSsoError(
      "Respons logout Klinik PKP tidak valid.",
      502,
      "INVALID_LOGOUT_RESPONSE",
    );
  }
  return { centralLogoutRequired: data.centralLogoutRequired };
}
