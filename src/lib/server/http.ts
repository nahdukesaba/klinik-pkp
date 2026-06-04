import "server-only";

import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/admin/backend-api";
import {
  createApiErrorBody,
  createApiSuccessBody,
  getApiErrorCode,
  getApiErrorCodeFromPayload,
  getApiErrorDetails,
  getApiErrorMessage,
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
  return getApiErrorMessage(payload) ?? fallback;
}

export function createJsonResponse(payload: unknown, status = 200) {
  const effectiveStatus =
    status < 400 && isRecord(payload) && payload.success === false
      ? 400
      : status;

  if (effectiveStatus >= 400) {
    return applySensitiveResponseHeaders(
      NextResponse.json(
        createApiErrorBody(
          effectiveStatus,
          extractErrorMessage(payload, "Permintaan tidak berhasil."),
          {
            code: getApiErrorCodeFromPayload(payload, effectiveStatus),
            details: getApiErrorDetails(payload),
          }
        ),
        { status: effectiveStatus }
      )
    );
  }

  if (isRecord(payload)) {
    if (payload.success === true && "data" in payload) {
      return applySensitiveResponseHeaders(
        NextResponse.json(
          createApiSuccessBody(payload.data, {
            meta: payload.meta,
          }),
          { status }
        )
      );
    }

    if ("data" in payload || "meta" in payload) {
      return applySensitiveResponseHeaders(
        NextResponse.json(
          createApiSuccessBody(payload.data ?? {}, {
            meta: payload.meta,
          }),
          { status }
        )
      );
    }

    if (payload.success === true) {
      const { success: _success, ...data } = payload;
      return applySensitiveResponseHeaders(
        NextResponse.json(createApiSuccessBody(data), { status })
      );
    }
  }

  return applySensitiveResponseHeaders(
    NextResponse.json(createApiSuccessBody(payload), { status })
  );
}

export function createJsonErrorResponse(
  message: string,
  status: number,
  details?: HttpErrorDetails,
  code?: string
) {
  return applySensitiveResponseHeaders(
    NextResponse.json(
      createApiErrorBody(status, message, {
        code,
        details: normalizeErrorDetails(details),
      }),
      { status }
    )
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
