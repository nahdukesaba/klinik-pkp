import "server-only";

import {
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

export async function readExternalJsonBody(request: Request) {
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
    if (response.status === 413) {
      return {
        error:
          "Ukuran upload terlalu besar. Kurangi jumlah file atau kompres file lalu coba lagi.",
      };
    }

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
  body?: FormData | ReadableStream<Uint8Array> | Record<string, unknown> | null;
  contentType?: string;
  id?: string;
  accessToken?: string;
}): Promise<ExternalAdminProxyResult> {
  try {
    getBackendApiBaseUrl();
  } catch {
    return createProxyTransportError(503, "Konfigurasi API_URL belum tersedia.");
  }

  const resourcePath = buildExternalResourcePath(params.resource, params.id);
  const url = buildBackendApiUrl(resourcePath);

  const headers = createBackendHeaders();
  if (params.accessToken) {
    headers.set("Authorization", `Bearer ${params.accessToken}`);
  }

  let body: BodyInit | undefined;
  const isReadableStreamBody =
    typeof ReadableStream !== "undefined" &&
    params.body instanceof ReadableStream;

  if (params.body instanceof FormData) {
    body = params.body;
  } else if (isReadableStreamBody) {
    body = params.body as ReadableStream<Uint8Array>;
    if (params.contentType) {
      headers.set("Content-Type", params.contentType);
    }
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
      // @ts-expect-error duplex diperlukan untuk streaming request body di Node.js fetch
      duplex: isReadableStreamBody ? "half" : undefined,
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
