import "server-only";

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
  requiredUploadFields?: RequiredUploadField[];
}

interface ExternalAdminProxyResult {
  ok: boolean;
  status: number;
  payload: Record<string, unknown>;
}

export type ExternalAdminRequestBody = FormData | Record<string, unknown> | null;

const EXTERNAL_RESOURCE_CONFIG: Record<
  ExternalAdminResource,
  ExternalResourceConfig
> = {
  faq: {
    upstreamPath: "faqs",
    bodyMode: "json",
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

function hasUploadedFile(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .some((value) => value instanceof Blob && value.size > 0);
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
    if (accessToken) {
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

  let currentData: Record<string, unknown> | null | undefined;

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

  const resourcePath = buildExternalResourcePath(
    params.resource,
    params.id,
    params.searchParams
  );
  const url = buildBackendApiUrl(resourcePath);

  const headers = createBackendHeaders();
  if (params.accessToken) {
    headers.set("Authorization", `Bearer ${params.accessToken}`);
  }

  const preparedBody = await hydrateRequiredUploadFields(params);
  let body: BodyInit | undefined;

  if (params.method === "GET") {
    body = undefined;
  } else if (preparedBody instanceof FormData) {
    body = preparedBody;
  } else if (preparedBody != null && params.method !== "DELETE") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(preparedBody);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: params.method,
      headers,
      body,
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return createProxyTransportError(
        504,
        "Waktu tunggu ke backend habis."
      );
    }

    return createProxyTransportError(502, "Layanan backend sedang tidak tersedia.");
  }

  const payload = await parseProxyResponsePayload(response);

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}
