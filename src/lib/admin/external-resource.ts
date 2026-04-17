import "server-only";

import {
  buildBackendProxyUrl,
  buildBackendApiUrl,
  createBackendHeaders,
  getBackendApiBaseUrl,
} from "./backend-api";

export type ExternalAdminResource =
  | "bsps"
  | "kumuh"
  | "rusun"
  | "bank-desain"
  | "sosialisasi";

type ResourceMode = "json" | "form-data";

interface ExternalResourceConfig {
  upstreamPath: string;
  bodyMode: ResourceMode;
}

interface ExternalAdminProxyResult {
  ok: boolean;
  status: number;
  payload: Record<string, unknown>;
}

const EXTERNAL_RESOURCE_CONFIG: Record<
  ExternalAdminResource,
  ExternalResourceConfig
> = {
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
  },
  "bank-desain": {
    upstreamPath: "bank-desain",
    bodyMode: "form-data",
  },
  sosialisasi: {
    upstreamPath: "sosialisasi",
    bodyMode: "form-data",
  },
};

export function resolveExternalAdminResource(resource: string) {
  return EXTERNAL_RESOURCE_CONFIG[resource as ExternalAdminResource] ?? null;
}

export async function readExternalResourceBody(
  request: Request,
  bodyMode: ResourceMode
) {
  if (bodyMode === "form-data") {
    return request.formData().catch(() => null);
  }

  return request.json().catch(() => null);
}

function buildExternalResourcePath(
  resource: ExternalAdminResource,
  id?: string
) {
  const config = EXTERNAL_RESOURCE_CONFIG[resource];
  return `${config.upstreamPath}${id ? `/${id}` : ""}`;
}

function createProxyTransportError(status: number, message: string) {
  return {
    ok: false,
    status,
    payload: { error: message },
  } satisfies ExternalAdminProxyResult;
}

async function parseProxyResponsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return response.ok
      ? { success: true }
      : { error: "Permintaan tidak berhasil." };
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

export async function proxyExternalAdminResource(params: {
  resource: ExternalAdminResource;
  method: "POST" | "PUT" | "DELETE";
  body?: FormData | Record<string, unknown> | null;
  id?: string;
  accessToken?: string;
  origin?: string;
}): Promise<ExternalAdminProxyResult> {
  try {
    getBackendApiBaseUrl();
  } catch {
    return createProxyTransportError(503, "Konfigurasi API_URL belum tersedia.");
  }

  const resourcePath = buildExternalResourcePath(params.resource, params.id);
  const url = params.origin
    ? buildBackendProxyUrl(params.origin, resourcePath)
    : buildBackendApiUrl(resourcePath);

  const headers = createBackendHeaders();
  if (params.accessToken) {
    headers.set("Authorization", `Bearer ${params.accessToken}`);
  }

  let body: BodyInit | undefined;
  if (params.body instanceof FormData) {
    body = params.body;
  } else if (params.body != null && params.method !== "DELETE") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(params.body);
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
