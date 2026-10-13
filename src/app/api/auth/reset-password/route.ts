import { NextRequest } from "next/server";

import {
  createJsonErrorResponse,
  createJsonResponse,
  createValidationErrorResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import {
  logoutSsoSession,
  resetPasswordWithSso,
  SsoAuthError,
} from "@/lib/server/sso-auth";
import { hasTrustedSameOrigin } from "@/lib/server/web-security";
import { resetPasswordSchema, validateForm } from "@/lib/validations";

export async function POST(request: NextRequest) {
  if (!hasTrustedSameOrigin(request)) {
    return createJsonErrorResponse("Origin permintaan tidak diizinkan.", 403);
  }

  const authorization = request.headers.get("authorization")?.trim() ?? "";

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return createJsonErrorResponse(
      "Sesi reset password tidak valid atau telah berakhir.",
      401,
      undefined,
      "invalid_recovery_token",
    );
  }

  const accessToken = authorization.slice(7).trim();

  if (!accessToken) {
    return createJsonErrorResponse(
      "Sesi reset password tidak valid atau telah berakhir.",
      401,
      undefined,
      "invalid_recovery_token",
    );
  }

  const body = await readJsonRequestBody<Record<string, unknown>>(request);

  if (!body) {
    return createJsonErrorResponse("Request body tidak valid.", 400);
  }

  const validation = validateForm(resetPasswordSchema, body);

  if (!validation.success) {
    return createValidationErrorResponse(
      "Password baru tidak valid.",
      validation.errors,
    );
  }

  try {
    await resetPasswordWithSso({
      accessToken,
      password: validation.data!.password,
    });

    try {
      await logoutSsoSession(accessToken);
    } catch {
      // Password sudah berhasil diperbarui.
      // Kegagalan revoke sesi recovery tidak boleh membatalkan hasil reset.
    }
  } catch (error) {
    if (error instanceof SsoAuthError) {
      return createJsonErrorResponse(
        error.message,
        error.status,
        undefined,
        error.code,
      );
    }

    return createJsonErrorResponse(
      "Layanan reset password sedang tidak tersedia.",
      502,
    );
  }

  return createJsonResponse({
    message: "Password berhasil diperbarui.",
  });
}
