import "server-only";

import {
  getApiErrorMessage,
  getApiErrorCode,
  type ApiErrorDetails,
} from "@/lib/api-response";
import { getDateKey, getTodayDateKey } from "@/lib/date";

import {
  buildBackendApiUrl,
  createBackendHeaders,
  getBackendApiBaseUrl,
} from "./backend-api";

export type ExternalAdminResource =
  | "faq"
  | "bsps"
  | "kumuh"
  | "rusun"
  | "bank-desain"
  | "sosialisasi";

type ResourceMode = "json" | "form-data";

interface RequiredUploadField {
  formField: string;
  existingField: string;
  responseField: "image_urls" | "file_urls";
}

interface ExternalResourceConfig {
  upstreamPath: string;
  bodyMode: ResourceMode;
  forwardAuth?: boolean;
  requiredUploadFields?: RequiredUploadField[];
}

interface ExternalAdminProxyResult {
  ok: boolean;
  status: number;
  payload: Record<string, unknown>;
}

export type ExternalAdminRequestBody = FormData | Record<string, unknown> | null;
const EXTERNAL_ADMIN_GET_RETRY_ATTEMPTS = 4;
const EXTERNAL_ADMIN_GET_RETRY_DELAY_MS = 250;
const TRANSIENT_BACKEND_ERROR_PATTERN =
  /prepared statement|SQLSTATE\s+(42P05|26000)/i;
const DUPLICATE_KEY_CONSTRAINT_PATTERN =
  /duplicate key value violates unique constraint\s+"?([^"\s)]+)"?/i;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const UNIQUE_CONSTRAINT_MESSAGES: Record<
  string,
  { field: string; message: string }
> = {
  idx_rusun_name: {
    field: "name",
    message:
      "Nama rusun sudah terpakai, termasuk pada data rusun yang pernah dihapus. Gunakan nama lain atau pulihkan data lama di backend.",
  },
};

const EXTERNAL_RESOURCE_CONFIG: Record<
  ExternalAdminResource,
  ExternalResourceConfig
> = {
  faq: {
    upstreamPath: "faqs",
    bodyMode: "json",
    forwardAuth: true,
  },
  bsps: {
    upstreamPath: "bsps",
    bodyMode: "json",
  },
  kumuh: {
    upstreamPath: "kumuh",
    bodyMode: "json",
  },
  rusun: {
    upstreamPath: "rusun",
    bodyMode: "form-data",
    requiredUploadFields: [
      {
        formField: "images",
        existingField: "existing_images",
        responseField: "image_urls",
      },
    ],
  },
  "bank-desain": {
    upstreamPath: "bank-desain",
    bodyMode: "form-data",
    requiredUploadFields: [
      {
        formField: "images",
        existingField: "existing_images",
        responseField: "image_urls",
      },
      {
        formField: "files",
        existingField: "existing_files",
        responseField: "file_urls",
      },
    ],
  },
  sosialisasi: {
    upstreamPath: "sosialisasi",
    bodyMode: "form-data",
  },
};

export function resolveExternalAdminResource(resource: string) {
  return EXTERNAL_RESOURCE_CONFIG[resource as ExternalAdminResource] ?? null;
}

function shouldForwardAuth(config: ExternalResourceConfig) {
  return config.forwardAuth !== false;
}

export async function readExternalAdminRequestBody(
  request: Request,
  bodyMode: ResourceMode
) {
  return (
    bodyMode === "form-data"
      ? request.formData()
      : request.json()
  ).catch(() => null) as Promise<ExternalAdminRequestBody>;
}

function buildExternalResourcePath(
  resource: ExternalAdminResource,
  id?: string,
  searchParams?: URLSearchParams
) {
  const config = EXTERNAL_RESOURCE_CONFIG[resource];
  const query = searchParams?.toString();
  const pathname = `${config.upstreamPath}${id ? `/${id}` : ""}`;

  return query ? `${pathname}?${query}` : pathname;
}

function createProxyTransportError(status: number, message: string) {
  return {
    ok: false,
    status,
    payload: { error: message },
  } satisfies ExternalAdminProxyResult;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPayloadText(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return "";
  }
}

function isBackendReportedFailure(payload: unknown) {
  return isRecord(payload) && payload.success === false;
}

function isTransientBackendPayload(payload: unknown) {
  return TRANSIENT_BACKEND_ERROR_PATTERN.test(getPayloadText(payload));
}

function getDuplicateKeyConstraint(payload: unknown) {
  const message = getApiErrorMessage(payload) ?? getPayloadText(payload);
  const match = DUPLICATE_KEY_CONSTRAINT_PATTERN.exec(message);
  return match?.[1];
}

function createDuplicateKeyConflictResult(payload: unknown) {
  const constraint = getDuplicateKeyConstraint(payload);
  if (!constraint) {
    return null;
  }

  const conflict = UNIQUE_CONSTRAINT_MESSAGES[constraint];
  const message =
    conflict?.message ??
    "Data dengan nilai yang sama sudah ada. Periksa kembali isian unik sebelum menyimpan.";
  const details: ApiErrorDetails | undefined = conflict
    ? { [conflict.field]: [message] }
    : undefined;

  return {
    ok: false,
    status: 409,
    payload: {
      error: {
        code: getApiErrorCode(409),
        message,
        ...(details ? { details } : {}),
      },
    },
  } satisfies ExternalAdminProxyResult;
}

async function createIdempotentDeleteResult(params: {
  resource: ExternalAdminResource;
  id?: string;
  accessToken?: string;
  response: Response;
  payload: Record<string, unknown>;
}) {
  if (
    params.response.status !== 404 ||
    !params.id ||
    !isBackendReportedFailure(params.payload)
  ) {
    return null;
  }

  const currentData = await fetchCurrentResourceData(
    params.resource,
    params.id,
    params.accessToken
  );

  if (currentData) {
    return null;
  }

  return {
    ok: true,
    status: 200,
    payload: {
      success: true,
      message: "Data sudah tidak tersedia di backend.",
    },
  } satisfies ExternalAdminProxyResult;
}

function hasUploadedFile(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .some((value) => isBlob(value) && value.size > 0);
}

function getFormString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getFormNumber(formData: FormData, field: string) {
  const parsed = Number(getFormString(formData, field));
  return Number.isFinite(parsed) ? parsed : null;
}

function getRecordString(body: Record<string, unknown>, field: string) {
  const value = body[field];
  return typeof value === "string" ? value.trim() : "";
}

function getRecordNumber(body: Record<string, unknown>, field: string) {
  const value = body[field];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function addValidationError(
  details: Record<string, string[]>,
  field: string,
  message: string
) {
  details[field] = [...(details[field] ?? []), message];
}

function isValidCoordinateValue(latitude: unknown, longitude: unknown) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

function parseFormCoordinate(formData: FormData) {
  const rawCoordinate = getFormString(formData, "coordinate");

  try {
    const coordinate = JSON.parse(rawCoordinate) as unknown;
    return isRecord(coordinate) ? coordinate : null;
  } catch {
    return null;
  }
}

function hasExistingFiles(formData: FormData, field: string) {
  const paths = getExistingUploadPaths(formData, field);
  return Array.isArray(paths) && paths.length > 0;
}

function validateRequiredFormStrings(
  formData: FormData,
  fields: readonly string[],
  details: Record<string, string[]>
) {
  for (const field of fields) {
    if (!getFormString(formData, field)) {
      addValidationError(details, field, "Wajib diisi.");
    }
  }
}

function validateRequiredFormNumbers(
  formData: FormData,
  fields: readonly string[],
  details: Record<string, string[]>
) {
  for (const field of fields) {
    const value = getFormNumber(formData, field);
    if (value === null) {
      addValidationError(details, field, "Harus berupa angka.");
    }
  }
}

function validateFormYear(
  formData: FormData,
  field: string,
  details: Record<string, string[]>
) {
  const value = getFormNumber(formData, field);
  if (value === null || value < MIN_YEAR || value > MAX_YEAR) {
    addValidationError(
      details,
      field,
      `Gunakan tahun antara ${MIN_YEAR} dan ${MAX_YEAR}.`
    );
  }
}

function validateFormCoordinate(
  formData: FormData,
  details: Record<string, string[]>
) {
  const coordinate = parseFormCoordinate(formData);

  if (
    !coordinate ||
    !isValidCoordinateValue(coordinate.latitude, coordinate.longitude)
  ) {
    addValidationError(
      details,
      "coordinate",
      "Koordinat harus berisi latitude dan longitude yang valid."
    );
  }
}

function validateRequiredRecordStrings(
  body: Record<string, unknown>,
  fields: readonly string[],
  details: Record<string, string[]>
) {
  for (const field of fields) {
    if (!getRecordString(body, field)) {
      addValidationError(details, field, "Wajib diisi.");
    }
  }
}

function validateRequiredRecordNumbers(
  body: Record<string, unknown>,
  fields: readonly string[],
  details: Record<string, string[]>
) {
  for (const field of fields) {
    if (getRecordNumber(body, field) === null) {
      addValidationError(details, field, "Harus berupa angka.");
    }
  }
}

function validateRecordYear(
  body: Record<string, unknown>,
  field: string,
  details: Record<string, string[]>
) {
  const value = getRecordNumber(body, field);
  if (value === null || value < MIN_YEAR || value > MAX_YEAR) {
    addValidationError(
      details,
      field,
      `Gunakan tahun antara ${MIN_YEAR} dan ${MAX_YEAR}.`
    );
  }
}

function validateRecordCoordinate(
  body: Record<string, unknown>,
  details: Record<string, string[]>
) {
  const coordinate = body.coordinate;

  if (
    !isRecord(coordinate) ||
    !isValidCoordinateValue(coordinate.latitude, coordinate.longitude)
  ) {
    addValidationError(
      details,
      "coordinate",
      "Koordinat harus berisi latitude dan longitude yang valid."
    );
  }
}

function createValidationResult(
  resource: ExternalAdminResource,
  details: Record<string, string[]>
) {
  const hasErrors = Object.keys(details).length > 0;

  return hasErrors
    ? {
        ok: false as const,
        status: 400,
        payload: {
          error: `Data ${resource} belum valid.`,
          details,
        },
      }
    : { ok: true as const };
}

function validateRusunFormData(
  _method: "POST" | "PUT",
  formData: FormData
) {
  const details: Record<string, string[]> = {};

  validateRequiredFormStrings(
    formData,
    ["village_id", "district_id", "region_id", "name", "address", "unit_type"],
    details
  );
  validateRequiredFormNumbers(
    formData,
    ["tower", "floor", "unit_count"],
    details
  );
  validateFormYear(formData, "year_given", details);
  validateFormCoordinate(formData, details);

  if (
    !hasUploadedFile(formData, "images") &&
    !hasExistingFiles(formData, "existing_images")
  ) {
    addValidationError(details, "images", "Upload 1 gambar rusun.");
  }

  return createValidationResult("rusun", details);
}

function validateBankDesainFormData(
  _method: "POST" | "PUT",
  formData: FormData
) {
  const details: Record<string, string[]> = {};

  validateRequiredFormStrings(formData, ["name", "type", "has_garage"], details);
  validateRequiredFormNumbers(
    formData,
    ["bedroom_count", "bathroom_count", "total_area"],
    details
  );

  if (
    !hasUploadedFile(formData, "images") &&
    !hasExistingFiles(formData, "existing_images")
  ) {
    addValidationError(details, "images", "Upload minimal 1 gambar desain.");
  }

  if (
    !hasUploadedFile(formData, "files") &&
    !hasExistingFiles(formData, "existing_files")
  ) {
    addValidationError(details, "files", "Upload 1 file RAB PDF.");
  }

  return createValidationResult("bank-desain", details);
}

function validateSosialisasiFormData(formData: FormData) {
  const details: Record<string, string[]> = {};

  validateRequiredFormStrings(
    formData,
    [
      "village_id",
      "district_id",
      "region_id",
      "title",
      "location",
      "description",
      "scheduled_at_start",
      "scheduled_at_end",
    ],
    details
  );
  validateFormCoordinate(formData, details);

  return createValidationResult("sosialisasi", details);
}

function getRecordStringValue(value: Record<string, unknown> | null, field: string) {
  const rawValue = value?.[field];
  return typeof rawValue === "string" ? rawValue : "";
}

function hasCurrentSosialisasiImages(data: Record<string, unknown> | null) {
  const imageUrls = data?.image_urls;
  return Array.isArray(imageUrls) && imageUrls.some((item) => typeof item === "string");
}

async function validateSosialisasiDocumentationUpload(params: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  id?: string;
  body?: ExternalAdminRequestBody;
  accessToken?: string;
}) {
  if (
    params.method === "GET" ||
    params.method === "DELETE" ||
    !(params.body instanceof FormData) ||
    !hasUploadedFile(params.body, "images")
  ) {
    return { ok: true as const };
  }

  const details: Record<string, string[]> = {};

  if (params.method === "POST") {
    addValidationError(
      details,
      "images",
      "Dokumentasi hanya bisa diunggah setelah kegiatan selesai dan statusnya Pending Dokumentasi."
    );
    return createValidationResult("sosialisasi", details);
  }

  const currentData = params.id
    ? await fetchCurrentResourceData("sosialisasi", params.id, params.accessToken)
    : null;
  const currentEndDate = getRecordStringValue(currentData, "scheduled_at_end");
  const formEndDate = getFormString(params.body, "scheduled_at_end");
  const scheduledEndDateKey = getDateKey(currentEndDate || formEndDate);
  const isUpcoming =
    !scheduledEndDateKey || scheduledEndDateKey > getTodayDateKey();

  if (isUpcoming) {
    addValidationError(
      details,
      "images",
      "Dokumentasi hanya bisa diunggah setelah kegiatan selesai."
    );
  }

  if (hasCurrentSosialisasiImages(currentData)) {
    addValidationError(
      details,
      "images",
      "Dokumentasi hanya bisa diunggah untuk status Pending Dokumentasi."
    );
  }

  return createValidationResult("sosialisasi", details);
}

function validateBspsJson(body: Record<string, unknown>) {
  const details: Record<string, string[]> = {};

  validateRequiredRecordStrings(
    body,
    ["village_id", "district_id", "region_id", "status"],
    details
  );
  validateRequiredRecordNumbers(body, ["unit_count"], details);
  validateRecordYear(body, "year_given", details);
  validateRecordCoordinate(body, details);

  return createValidationResult("bsps", details);
}

function validateKumuhJson(body: Record<string, unknown>) {
  const details: Record<string, string[]> = {};

  validateRequiredRecordStrings(
    body,
    ["district_id", "region_id", "area_name", "environments", "villages"],
    details
  );
  validateRequiredRecordNumbers(
    body,
    ["total_area", "total_population", "slum_value"],
    details
  );
  validateRecordYear(body, "year_inspected", details);
  validateRecordCoordinate(body, details);

  return createValidationResult("kumuh", details);
}

function validateExternalMutationBody(params: {
  resource: ExternalAdminResource;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: ExternalAdminRequestBody;
}) {
  if (params.method === "GET" || params.method === "DELETE") {
    return { ok: true as const };
  }

  if (params.resource === "rusun" && params.body instanceof FormData) {
    return validateRusunFormData(params.method, params.body);
  }

  if (params.resource === "bank-desain" && params.body instanceof FormData) {
    return validateBankDesainFormData(params.method, params.body);
  }

  if (params.resource === "sosialisasi" && params.body instanceof FormData) {
    return validateSosialisasiFormData(params.body);
  }

  if (params.resource === "bsps" && isRecord(params.body)) {
    return validateBspsJson(params.body);
  }

  if (params.resource === "kumuh" && isRecord(params.body)) {
    return validateKumuhJson(params.body);
  }

  return { ok: true as const };
}

function getMutationBodyId(resource: ExternalAdminResource, id: string) {
  if (resource === "faq") {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : id;
  }

  return id;
}

function attachMutationResourceId(params: {
  resource: ExternalAdminResource;
  method: "GET" | "POST" | "PUT" | "DELETE";
  id?: string;
  body?: ExternalAdminRequestBody;
}) {
  if (params.method !== "PUT" || !params.id || !params.body) {
    return params.body;
  }

  if (params.body instanceof FormData) {
    params.body.set("id", params.id);
    return params.body;
  }

  return {
    ...params.body,
    id: getMutationBodyId(params.resource, params.id),
  };
}

function normalizeUploadPath(value: string) {
  try {
    const url = new URL(value, "http://localhost");
    const pathname = url.pathname;

    if (pathname.startsWith("/api/ext/")) {
      return pathname.slice("/api/ext/".length);
    }

    if (pathname.startsWith("/api/v1/")) {
      return pathname.slice("/api/v1/".length);
    }

    return pathname.replace(/^\/+/, "");
  } catch {
    return value.replace(/^\/+/, "");
  }
}

function getFilenameFromPath(path: string, fallback: string) {
  const filename = path.split("/").filter(Boolean).pop();
  return filename ? decodeURIComponent(filename) : fallback;
}

function getExistingUploadPaths(formData: FormData, field: string) {
  const rawValue = formData.get(field);
  if (typeof rawValue !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => (isRecord(item) && typeof item.url === "string" ? item.url : ""))
      .filter(Boolean)
      .map(normalizeUploadPath);
  } catch {
    return [];
  }
}

async function fetchCurrentResourceData(
  resource: ExternalAdminResource,
  id: string,
  accessToken?: string
) {
  try {
    const url = buildBackendApiUrl(buildExternalResourcePath(resource, id));
    const headers = createBackendHeaders();
    const config = EXTERNAL_RESOURCE_CONFIG[resource];
    if (accessToken && shouldForwardAuth(config)) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !isRecord(payload) || !isRecord(payload.data)) {
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
}

function getCurrentUploadPaths(
  data: Record<string, unknown> | null,
  responseField: RequiredUploadField["responseField"]
) {
  const value = data?.[responseField];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

async function appendBackendUploadFile(
  formData: FormData,
  field: string,
  path: string,
  index: number
) {
  try {
    const uploadPath = normalizeUploadPath(path);
    const response = await fetch(buildBackendApiUrl(uploadPath), {
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      return false;
    }

    formData.append(
      field,
      blob,
      getFilenameFromPath(uploadPath, `${field}-${index + 1}`)
    );
    return true;
  } catch {
    return false;
  }
}

async function hydrateRequiredUploadFields(params: {
  resource: ExternalAdminResource;
  id?: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: ExternalAdminRequestBody;
  accessToken?: string;
  currentData?: Record<string, unknown> | null;
}) {
  const config = EXTERNAL_RESOURCE_CONFIG[params.resource];

  if (
    params.method !== "PUT" ||
    !params.id ||
    !(params.body instanceof FormData) ||
    !config.requiredUploadFields?.length
  ) {
    return params.body;
  }

  let currentData: Record<string, unknown> | null | undefined =
    params.currentData;

  for (const uploadField of config.requiredUploadFields) {
    if (hasUploadedFile(params.body, uploadField.formField)) {
      params.body.delete(uploadField.existingField);
      continue;
    }

    const requestedExistingPaths = getExistingUploadPaths(
      params.body,
      uploadField.existingField
    );
    params.body.delete(uploadField.existingField);

    const pathsToUse =
      requestedExistingPaths !== null
        ? requestedExistingPaths
        : getCurrentUploadPaths(
            currentData ??
              (currentData = await fetchCurrentResourceData(
                params.resource,
                params.id,
                params.accessToken
              )),
            uploadField.responseField
          );

    for (const [index, path] of pathsToUse.entries()) {
      await appendBackendUploadFile(
        params.body,
        uploadField.formField,
        path,
        index
      );
    }
  }

  return params.body;
}

async function parseProxyResponsePayload(response: Response) {
  const text = await response.text();

  if (response.status === 413) {
    return {
      error:
        "Ukuran upload melebihi batas aman backend. Kurangi ukuran file sedikit lalu coba lagi.",
    };
  }

  if (!text) {
    return response.ok
      ? { success: true }
      : { error: "Permintaan tidak berhasil." };
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    if (text.trim().startsWith("<")) {
      return {
        error:
          response.status >= 500
            ? "Layanan backend sedang mengalami gangguan."
            : "Permintaan ke backend tidak berhasil diproses.",
      };
    }

    return { message: text };
  }
}

export async function proxyExternalAdminResource(params: {
  resource: ExternalAdminResource;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: ExternalAdminRequestBody;
  id?: string;
  accessToken?: string;
  searchParams?: URLSearchParams;
}): Promise<ExternalAdminProxyResult> {
  try {
    getBackendApiBaseUrl();
  } catch {
    return createProxyTransportError(503, "Konfigurasi API_URL belum tersedia.");
  }

  const config = EXTERNAL_RESOURCE_CONFIG[params.resource];
  const resourcePath = buildExternalResourcePath(
    params.resource,
    params.id,
    params.searchParams
  );
  const url = buildBackendApiUrl(resourcePath);

  const headers = createBackendHeaders();
  if (params.accessToken && shouldForwardAuth(config)) {
    headers.set("Authorization", `Bearer ${params.accessToken}`);
  }

  const documentationValidation =
    params.resource === "sosialisasi"
      ? await validateSosialisasiDocumentationUpload({
          method: params.method,
          id: params.id,
          body: params.body,
          accessToken: params.accessToken,
        })
      : { ok: true as const };

  if (!documentationValidation.ok) {
    return documentationValidation;
  }

  const preparedBody = attachMutationResourceId({
    ...params,
    body: await hydrateRequiredUploadFields({
      ...params,
    }),
  });
  const validation = validateExternalMutationBody({
    resource: params.resource,
    method: params.method,
    body: preparedBody,
  });

  if (!validation.ok) {
    return validation;
  }

  let body: BodyInit | undefined;

  if (params.method === "GET") {
    body = undefined;
  } else if (preparedBody instanceof FormData) {
    body = preparedBody;
  } else if (preparedBody != null && params.method !== "DELETE") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(preparedBody);
  }

  let response: Response | null = null;
  let payload: Record<string, unknown> = {};
  const maxAttempts =
    params.method === "GET" ? EXTERNAL_ADMIN_GET_RETRY_ATTEMPTS + 1 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      response = await fetch(url, {
        method: params.method,
        headers,
        body,
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      });
      payload = await parseProxyResponsePayload(response);

      if (
        attempt < maxAttempts &&
        isBackendReportedFailure(payload) &&
        isTransientBackendPayload(payload)
      ) {
        await sleep(EXTERNAL_ADMIN_GET_RETRY_DELAY_MS * attempt);
        continue;
      }

      break;
    } catch (error) {
      if (attempt < maxAttempts) {
        await sleep(EXTERNAL_ADMIN_GET_RETRY_DELAY_MS * attempt);
        continue;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        return createProxyTransportError(
          504,
          "Waktu tunggu ke backend habis."
        );
      }

      return createProxyTransportError(
        502,
        "Layanan backend sedang tidak tersedia."
      );
    }
  }

  if (!response) {
    return createProxyTransportError(502, "Layanan backend sedang tidak tersedia.");
  }

  if (params.method === "DELETE") {
    const idempotentDeleteResult = await createIdempotentDeleteResult({
      resource: params.resource,
      id: params.id,
      accessToken: params.accessToken,
      response,
      payload,
    });

    if (idempotentDeleteResult) {
      return idempotentDeleteResult;
    }
  }

  const duplicateKeyConflict = createDuplicateKeyConflictResult(payload);
  if (duplicateKeyConflict) {
    return duplicateKeyConflict;
  }

  const backendReportedFailure = isBackendReportedFailure(payload);
  const status =
    response.ok && backendReportedFailure
      ? isTransientBackendPayload(payload)
        ? 502
        : 400
      : response.status;

  return {
    ok: response.ok && !backendReportedFailure,
    status,
    payload,
  };
}
