import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BACKEND_ACCESS_COOKIE_NAME } from "@/lib/auth";
import { buildTrustedServiceUrl } from "@/lib/auth/browser-sso-contract";
import {
  clearAuthenticatedSessionCookies,
  getAuthenticatedSessionUserFromCookies,
} from "@/lib/server/auth-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedSessionUserFromCookies();
  if (!user || user.status !== "approved") {
    return clearAuthenticatedSessionCookies(
      NextResponse.json(
        {
          error: "unauthorized",
          message: "Autentikasi diperlukan.",
          apps: [],
        },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      ),
    );
  }

  const ssoBase = (process.env.SSO_BASE_URL?.trim() || "http://localhost:8082").replace(/\/+$/, "");
  const defaultLogoUrl = `${ssoBase}/widget/default-logo.png`;
  const cookieStore = await cookies();
  const backendToken = cookieStore.get(BACKEND_ACCESS_COOKIE_NAME)?.value?.trim();

  if (backendToken) {
    try {
      const response = await fetch(
        buildTrustedServiceUrl(ssoBase, "api/v1/auth/apps"),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${backendToken}`,
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5_000),
        },
      );
      if (response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          defaultLogoUrl?: string;
          apps?: unknown[];
        } | null;
        return NextResponse.json(
          {
            ssoBaseUrl: ssoBase,
            defaultLogoUrl: payload?.defaultLogoUrl || defaultLogoUrl,
            apps: Array.isArray(payload?.apps) ? payload.apps : [],
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
    } catch {
      // Fallback below
    }
  }

  return NextResponse.json(
    {
      ssoBaseUrl: ssoBase,
      defaultLogoUrl,
      apps: [],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
