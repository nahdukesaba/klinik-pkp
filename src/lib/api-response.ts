import { NextResponse } from "next/server";

export type ApiErrorDetails = Record<string, unknown>;

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetails;
  };
}

export interface ApiSuccessBody<TData = unknown, TMeta = unknown> {
  success: true;
  data: TData;
  meta?: TMeta;
}

export type ApiResponseBody<TData = unknown, TMeta = unknown> =
  | ApiSuccessBody<TData, TMeta>
  | ApiErrorBody;

const STATUS_ERROR_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "RESOURCE_NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "RATE_LIMITED",
  500: "INTERNAL_SERVER_ERROR",
  502: "BAD_GATEWAY",
  503: "SERVICE_UNAVAILABLE",
  504: "GATEWAY_TIMEOUT",
};

export function getApiErrorCode(status: number) {
  return STATUS_ERROR_CODES[status] ?? (
    status >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED"
  );
}

export function apiSuccess<TData, TMeta = unknown>(
  data: TData,
  options: {
    status?: number;
    meta?: TMeta;
    headers?: HeadersInit;
  } = {}
) {
  const body: ApiSuccessBody<TData, TMeta> = {
    success: true,
    data,
    ...(options.meta === undefined ? {} : { meta: options.meta }),
  };

  return NextResponse.json(body, {
    status: options.status ?? 200,
    headers: options.headers,
  });
}

export function apiError(
  status: number,
  message: string,
  options: {
    code?: string;
    details?: ApiErrorDetails;
    headers?: HeadersInit;
  } = {}
) {
  const body: ApiErrorBody = {
    success: false,
    error: {
      code: options.code ?? getApiErrorCode(status),
      message,
      ...(options.details ? { details: options.details } : {}),
    },
  };

  return NextResponse.json(body, {
    status,
    headers: options.headers,
  });
}

