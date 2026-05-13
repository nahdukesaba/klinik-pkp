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
  0: "NETWORK_ERROR",
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "RESOURCE_NOT_FOUND",
  408: "REQUEST_TIMEOUT",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "RATE_LIMITED",
  500: "INTERNAL_SERVER_ERROR",
  502: "BAD_GATEWAY",
  503: "SERVICE_UNAVAILABLE",
  504: "GATEWAY_TIMEOUT",
};

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  0: "Koneksi ke server tidak tersedia. Periksa koneksi Anda lalu coba lagi.",
  400: "Permintaan tidak valid. Periksa kembali data yang diisi.",
  401: "Sesi Anda telah berakhir. Silakan login ulang.",
  403: "Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.",
  404: "Data yang diminta tidak ditemukan.",
  409: "Data tidak dapat disimpan karena konflik dengan data yang sudah ada.",
  422: "Data yang dikirim belum valid.",
  429: "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.",
  500: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
  502: "Layanan backend sedang tidak dapat dijangkau.",
  503: "Layanan sedang tidak tersedia. Silakan coba beberapa saat lagi.",
  504: "Waktu respons server habis. Silakan coba lagi.",
};

const BACKEND_MESSAGE_STATUSES = new Set([400, 409, 422]);

export interface NormalizedApiError {
  status: number;
  code: string;
  message: string;
  details?: ApiErrorDetails;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getApiErrorCode(status: number) {
  return STATUS_ERROR_CODES[status] ?? (
    status >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED"
  );
}

export function getFriendlyApiErrorMessage(
  status: number,
  backendMessage?: string
) {
  if (backendMessage && BACKEND_MESSAGE_STATUSES.has(status)) {
    return backendMessage;
  }

  return STATUS_ERROR_MESSAGES[status] ?? (
    status >= 500
      ? STATUS_ERROR_MESSAGES[500]
      : "Permintaan tidak berhasil diproses."
  );
}

export function getApiPayloadData(payload: unknown) {
  if (
    isRecord(payload) &&
    payload.success === true &&
    "data" in payload
  ) {
    return payload.data;
  }

  return payload;
}

export function getApiErrorMessage(payload: unknown) {
  if (!isRecord(payload)) {
    return undefined;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (
    isRecord(payload.error) &&
    typeof payload.error.message === "string" &&
    payload.error.message.trim()
  ) {
    return payload.error.message;
  }

  return typeof payload.message === "string" && payload.message.trim()
    ? payload.message
    : undefined;
}

export function getApiErrorDetails(payload: unknown) {
  if (!isRecord(payload)) {
    return undefined;
  }

  if (isRecord(payload.error) && isRecord(payload.error.details)) {
    return payload.error.details;
  }

  return isRecord(payload.details) ? payload.details : undefined;
}

export function getApiErrorCodeFromPayload(payload: unknown, status: number) {
  if (
    isRecord(payload) &&
    isRecord(payload.error) &&
    typeof payload.error.code === "string" &&
    payload.error.code.trim()
  ) {
    return payload.error.code;
  }

  return getApiErrorCode(status);
}

export function normalizeApiError(
  status: number,
  payload: unknown,
  fallbackMessage?: string
): NormalizedApiError {
  const backendMessage = getApiErrorMessage(payload) ?? fallbackMessage;

  return {
    status,
    code: getApiErrorCodeFromPayload(payload, status),
    message: getFriendlyApiErrorMessage(status, backendMessage),
    details: getApiErrorDetails(payload),
  };
}

export function createApiSuccessBody<TData, TMeta = unknown>(
  data: TData,
  options: {
    meta?: TMeta;
  } = {}
) {
  return {
    success: true,
    data,
    ...(options.meta === undefined ? {} : { meta: options.meta }),
  } satisfies ApiSuccessBody<TData, TMeta>;
}

export function createApiErrorBody(
  status: number,
  message: string,
  options: {
    code?: string;
    details?: ApiErrorDetails;
  } = {}
) {
  return {
    success: false,
    error: {
      code: options.code ?? getApiErrorCode(status),
      message,
      ...(options.details ? { details: options.details } : {}),
    },
  } satisfies ApiErrorBody;
}
