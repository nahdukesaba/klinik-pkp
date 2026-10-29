import "server-only";

import {
  requireAuthenticatedUser,
  type AuthenticatedUser,
  type LoginSource,
} from "@/lib/auth/session-contract";
import { sanitizeEmail, sanitizeNip } from "@/lib/security";
import {
  getKlinikContext,
  loginWithSso,
  refreshSsoSession,
  SsoAuthError,
} from "@/lib/server/sso-auth";

export type CentralAuthResult =
  | {
      ok: true;
      user: AuthenticatedUser;
      backendAccessToken: string;
      backendRefreshToken?: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
      details?: Record<string, string | string[]>;
    };

function buildCanonicalUser(
  session: Awaited<ReturnType<typeof loginWithSso>>,
  klinikContext: Awaited<ReturnType<typeof getKlinikContext>>,
  loginSource: LoginSource,
) {
  if (session.user.appUserId !== klinikContext.appUserId) {
    throw new SsoAuthError(
      "Identitas sesi SSO tidak konsisten.",
      403,
      "canonical_identity_mismatch",
    );
  }

  return requireAuthenticatedUser({
    appUserId: klinikContext.appUserId,
    authUserId: klinikContext.authUserId,
    fullName: klinikContext.fullName,
    email: sanitizeEmail(klinikContext.email),
    phone: klinikContext.phone,
    nip: klinikContext.nip ? sanitizeNip(klinikContext.nip) : null,
    role: klinikContext.role,
    status: klinikContext.status,
    loginSource,
  });
}

export async function authenticateAgainstCentralSso(input: {
  email: string;
  password: string;
}): Promise<CentralAuthResult> {
  try {
    const session = await loginWithSso({
      email: sanitizeEmail(input.email),
      password: input.password,
    });

    const klinikContext = await getKlinikContext(session.accessToken);

    return {
      ok: true,
      user: buildCanonicalUser(session, klinikContext, "direct"),
      backendAccessToken: session.accessToken,
      backendRefreshToken: session.refreshToken,
    };
  } catch (error) {
    if (error instanceof SsoAuthError) {
      return {
        ok: false,
        status: error.status,
        error: error.message,
      };
    }

    return {
      ok: false,
      status: 502,
      error: "Layanan autentikasi sedang tidak tersedia.",
    };
  }
}

export async function refreshCentralSession(params: {
  backendRefreshToken: string;
  loginSource: LoginSource;
}): Promise<CentralAuthResult> {
  try {
    const session = await refreshSsoSession(params.backendRefreshToken);
    const klinikContext = await getKlinikContext(session.accessToken);

    return {
      ok: true,
      user: buildCanonicalUser(session, klinikContext, params.loginSource),
      backendAccessToken: session.accessToken,
      backendRefreshToken: session.refreshToken,
    };
  } catch (error) {
    if (error instanceof SsoAuthError) {
      return {
        ok: false,
        status: error.status,
        error: error.message,
      };
    }

    return {
      ok: false,
      status: 502,
      error: "Layanan autentikasi sedang tidak tersedia.",
    };
  }
}
