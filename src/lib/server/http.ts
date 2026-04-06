import "server-only";

import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/admin/backend-api";

export type HttpErrorDetails = Record<string, string | string[]>;

export function createJsonResponse(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status });
}

export function createJsonErrorResponse(
  message: string,
  status: number,
  details?: HttpErrorDetails
) {
  return createJsonResponse(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    status
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
    return createJsonErrorResponse(error.message, error.status, error.details);
  }

  return createJsonErrorResponse(fallbackMessage, 500);
}

export async function readJsonRequestBody<T>(request: Request) {
  return request.json().catch(() => null) as Promise<T | null>;
}
