import "server-only";

import { BackendApiError } from "@/lib/admin/backend-api";
import {
  apiError,
  apiSuccess,
  getApiErrorCode,
  type ApiErrorDetails,
} from "@/lib/api-response";
import { applySensitiveResponseHeaders } from "@/lib/server/web-security";

export type HttpErrorDetails = Record<string, string | string[]>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeErrorDetails(details?: HttpErrorDetails): ApiErrorDetails | undefined {
  return details as ApiErrorDetails | undefined;
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (!isRecord(payload)) {
    return fallback;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (isRecord(payload.error) && typeof payload.error.message === "string") {
    return payload.error.message;
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
}

function extractErrorDetails(payload: unknown) {
  if (!isRecord(payload)) {
    return undefined;
  }

  if (isRecord(payload.error) && isRecord(payload.error.details)) {
    return payload.error.details;
  }

  if (isRecord(payload.details)) {
    return payload.details;
  }

  return undefined;
}

function extractErrorCode(payload: unknown, status: number) {
  if (
    isRecord(payload) &&
    isRecord(payload.error) &&
    typeof payload.error.code === "string"
  ) {
    return payload.error.code;
  }

  return getApiErrorCode(status);
}

export function createJsonResponse(payload: unknown, status = 200) {
  if (status >= 400) {
    return applySensitiveResponseHeaders(
      apiError(status, extractErrorMessage(payload, "Permintaan tidak berhasil."), {
        code: extractErrorCode(payload, status),
        details: extractErrorDetails(payload),
      })
    );
  }

  if (isRecord(payload)) {
    if (payload.success === true && "data" in payload) {
      return applySensitiveResponseHeaders(
        apiSuccess(payload.data, {
          status,
          meta: payload.meta,
        })
      );
    }

    if ("data" in payload || "meta" in payload) {
      return applySensitiveResponseHeaders(
        apiSuccess(payload.data ?? {}, {
          status,
          meta: payload.meta,
        })
      );
    }

    if (payload.success === true) {
      const { success: _success, ...data } = payload;
      return applySensitiveResponseHeaders(apiSuccess(data, { status }));
    }
  }

  return applySensitiveResponseHeaders(apiSuccess(payload, { status }));
}

export function createJsonErrorResponse(
  message: string,
  status: number,
  details?: HttpErrorDetails,
  code?: string
) {
  return applySensitiveResponseHeaders(
    apiError(status, message, {
      code,
      details: normalizeErrorDetails(details),
    })
  );
}

export function createValidationErrorResponse(
  message: string,
  details?: HttpErrorDetails,
  status = 400
) {
  return createJsonErrorResponse(message, status, details);
}

export function createBackendErrorResponse(
  error: unknown,
  fallbackMessage: string
) {
  if (error instanceof BackendApiError) {
    return createJsonErrorResponse(
      error.message,
      error.status,
      error.details,
      getApiErrorCode(error.status)
    );
  }

  return createJsonErrorResponse(
    fallbackMessage,
    500,
    undefined,
    "INTERNAL_SERVER_ERROR"
  );
}

export async function readJsonRequestBody<T>(request: Request) {
  return request.json().catch(() => null) as Promise<T | null>;
}
