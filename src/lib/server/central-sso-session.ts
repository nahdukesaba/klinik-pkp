import "server-only";

import { buildTrustedServiceUrl } from "@/lib/auth/browser-sso-contract";
import type { AuthenticatedUser } from "@/lib/auth/session-contract";

export async function isCentralSsoSessionActive(
  user: AuthenticatedUser,
): Promise<boolean> {
  if (user.loginSource === "direct") {
    return true;
  }
  if (!user.ssoSessionId) {
    return false;
  }

  const baseUrl = process.env.SSO_BASE_URL?.trim();
  const clientId = process.env.SSO_CLIENT_ID?.trim() || "klinik-pkp-web";
  const secret = process.env.SSO_INTROSPECTION_SECRET?.trim();
  if (!baseUrl || !secret || secret.length < 32) {
    return false;
  }

  try {
    const response = await fetch(
      buildTrustedServiceUrl(baseUrl, "api/v1/auth/sso/introspect"),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          sid: user.ssoSessionId,
          appUserId: user.appUserId,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!response.ok) return false;
    const payload = (await response.json().catch(() => null)) as {
      active?: unknown;
    } | null;
    return payload?.active === true;
  } catch {
    return false;
  }
}
