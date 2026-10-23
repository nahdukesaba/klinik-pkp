import { NextRequest } from "next/server";

import {
  getRequestIpAddress,
  hasValidCsrfToken,
} from "@/lib/admin/security";
import {
  createSessionAdminUser,
  recordSuccessfulLogin,
} from "@/lib/admin/service";
import type { AuthUser } from "@/lib/auth";
import {
  browserSsoSessionDecision,
  readBrowserSsoCallback,
  resolveAccessOutcomePath,
} from "@/lib/auth/browser-sso-contract";
import { toPublicAuthenticatedUser } from "@/lib/auth/session-contract";
import { attachAuthenticatedSessionCookies } from "@/lib/server/auth-session";
import {
  createJsonErrorResponse,
  createJsonResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import {
  exchangeKlinikBrowserSso,
  KlinikBrowserSsoError,
} from "@/lib/server/klinik-browser-sso";
import { hasTrustedSameOrigin } from "@/lib/server/web-security";

function bodySearchParams(body: Record<string, unknown>) {
  return {
    get(name: string) {
      const value = body[name];
      return typeof value === "string" ? value : null;
    },
  };
}

function accessDenial(error: KlinikBrowserSsoError, status?: string) {
  if (error.status !== 403) {
    return null;
  }
  const outcome = status === "disabled" ? "disabled" : "rejected";
  return {
    code: outcome === "disabled" ? "ACCOUNT_DISABLED" : "ACCOUNT_REJECTED",
    message:
      outcome === "disabled"
        ? "Akses ke Klinik PKP dinonaktifkan."
        : "Akses ke Klinik PKP ditolak.",
    path: resolveAccessOutcomePath(outcome),
  };
}

export async function POST(request: NextRequest) {
  if (!hasTrustedSameOrigin(request)) {
    return createJsonErrorResponse("Origin permintaan tidak diizinkan.", 403);
  }
  if (!hasValidCsrfToken(request)) {
    return createJsonErrorResponse(
      "Request tidak valid. Silakan ulangi proses masuk.",
      403,
      undefined,
      "INVALID_CSRF_TOKEN",
    );
  }

  const body = await readJsonRequestBody<Record<string, unknown>>(request);
  const callback = body ? readBrowserSsoCallback(bodySearchParams(body)) : null;
  if (!callback) {
    return createJsonErrorResponse(
      "Kode atau state autentikasi tidak lengkap.",
      400,
      undefined,
      "INVALID_SSO_CALLBACK",
    );
  }

  try {
    const exchange = await exchangeKlinikBrowserSso(callback);
    if (exchange.status === "pending") {
      const decision = browserSsoSessionDecision(exchange.status);
      return createJsonResponse({
        success: true,
        data: {
          status: "pending",
          redirectTo: decision.redirectTo,
        },
      });
    }

    const sessionDecision = browserSsoSessionDecision(
      exchange.status,
      exchange.user.role,
    );
    if (!sessionDecision.createSession) {
      return createJsonErrorResponse(
        "Akun tidak memiliki akses ke dashboard admin Klinik PKP.",
        403,
        { redirectTo: sessionDecision.redirectTo },
        "KLINIK_ADMIN_ACCESS_REQUIRED",
      );
    }

    let authenticatedUser: AuthUser;
    try {
      authenticatedUser = createSessionAdminUser(exchange.user);
    } catch {
      return createJsonErrorResponse(
        "Akun tidak memiliki akses ke dashboard admin Klinik PKP.",
        403,
        undefined,
        "KLINIK_ADMIN_ACCESS_REQUIRED",
      );
    }

    try {
      await recordSuccessfulLogin(
        {
          appUserId: authenticatedUser.appUserId,
          fullName: authenticatedUser.fullName,
        },
        getRequestIpAddress(request),
      );
    } catch {
      // Audit tidak boleh menggagalkan sesi yang sudah divalidasi backend.
    }

    const response = createJsonResponse({
      success: true,
      data: {
        status: "authenticated",
        redirectTo: "/admin",
        user: toPublicAuthenticatedUser(authenticatedUser),
      },
    });
    return attachAuthenticatedSessionCookies(response, authenticatedUser, {
      accessToken: exchange.accessToken,
      refreshToken: exchange.refreshToken,
    });
  } catch (error) {
    if (error instanceof KlinikBrowserSsoError) {
      const denial = accessDenial(error, callback.status);
      if (denial) {
        return createJsonErrorResponse(
          denial.message,
          error.status,
          { redirectTo: denial.path },
          denial.code,
        );
      }
      return createJsonErrorResponse(
        error.message,
        error.status,
        undefined,
        error.code,
      );
    }
    return createJsonErrorResponse(
      "Proses masuk dengan Akun Balai gagal.",
      500,
    );
  }
}
