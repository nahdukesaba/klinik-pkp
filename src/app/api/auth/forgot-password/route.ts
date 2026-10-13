import { NextRequest } from "next/server";

import { getRequestIpAddress } from "@/lib/admin/security";
import {
  createJsonErrorResponse,
  createJsonResponse,
  createValidationErrorResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import { checkRateLimit } from "@/lib/server/rate-limit";
import {
  requestPasswordRecoveryWithSso,
  SsoAuthError,
} from "@/lib/server/sso-auth";
import { hasTrustedSameOrigin } from "@/lib/server/web-security";
import { forgotPasswordSchema, validateForm } from "@/lib/validations";

const MAX_PASSWORD_RECOVERY_ATTEMPTS = 3;
const PASSWORD_RECOVERY_WINDOW_MS = 5 * 60_000;

export async function POST(request: NextRequest) {
  if (!hasTrustedSameOrigin(request)) {
    return createJsonErrorResponse("Origin permintaan tidak diizinkan.", 403);
  }

  const body = await readJsonRequestBody<Record<string, unknown>>(request);

  if (!body) {
    return createJsonErrorResponse("Request body tidak valid.", 400);
  }

  const validation = validateForm(forgotPasswordSchema, body);

  if (!validation.success) {
    return createValidationErrorResponse(
      "Data reset password tidak valid.",
      validation.errors,
    );
  }

  const ipAddress = getRequestIpAddress(request);

  if (
    !checkRateLimit(
      ipAddress,
      MAX_PASSWORD_RECOVERY_ATTEMPTS,
      PASSWORD_RECOVERY_WINDOW_MS,
    )
  ) {
    return createJsonErrorResponse(
      "Terlalu banyak permintaan reset password. Silakan coba lagi nanti.",
      429,
    );
  }

  try {
    await requestPasswordRecoveryWithSso({
      email: validation.data!.email,
      application: "klinik_pkp",
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

  return createJsonResponse(
    {
      message: "Jika email terdaftar, instruksi reset password akan dikirim.",
    },
    202,
  );
}
