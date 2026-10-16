import { NextRequest } from "next/server";

import {
  createJsonErrorResponse,
  createJsonResponse,
  createValidationErrorResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import {
  resetPasswordWithSso,
  SsoAuthError,
} from "@/lib/server/sso-auth";
import { hasTrustedSameOrigin } from "@/lib/server/web-security";
import { resetPasswordSchema, validateForm } from "@/lib/validations";

export async function POST(request: NextRequest) {
  if (!hasTrustedSameOrigin(request)) {
    return createJsonErrorResponse("Origin permintaan tidak diizinkan.", 403);
  }

  const body = await readJsonRequestBody<Record<string, unknown>>(request);

  if (!body) {
    return createJsonErrorResponse("Request body tidak valid.", 400);
  }

  const tokenHash =
    typeof body.tokenHash === "string" ? body.tokenHash.trim() : "";

  if (!tokenHash) {
    return createJsonErrorResponse(
      "Sesi reset password tidak valid atau telah berakhir.",
      401,
      undefined,
      "invalid_recovery_token",
    );
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
      tokenHash,
      password: validation.data!.password,
    });
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
