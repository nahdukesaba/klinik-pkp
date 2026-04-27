import "server-only";

import { type NextRequest, NextResponse } from "next/server";

import {
  normalizeBackendPathname,
  requireBackendApiBaseUrl,
} from "@/lib/server/backend-config";

const BACKEND_TIMEOUT_MS = 30_000;

const INFRA_ERROR_STATUS = new Set([404, 502, 503, 520, 521, 522, 523, 524]);

const ALLOWED_REQUEST_HEADERS = new Set([
  "accept",
  "content-type",
  "if-none-match",
  "if-modified-since",
  "if-range",
  "range",
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "transfer-encoding",
  "connection",
  "set-cookie",
]);

function buildBackendUrl(path: string[], searchParams: URLSearchParams) {
  const backendApiUrl = requireBackendApiBaseUrl();
  const joinedPath = normalizeBackendPathname(path.join("/"));
  const query = searchParams.toString();

  return query
    ? `${backendApiUrl}/${joinedPath}?${query}`
    : `${backendApiUrl}/${joinedPath}`;
}

function forwardRequestHeaders(incoming: Headers) {
  const forwarded = new Headers();

  for (const [key, value] of incoming.entries()) {
    if (ALLOWED_REQUEST_HEADERS.has(key.toLowerCase())) {
      forwarded.set(key, value);
    }
  }

  return forwarded;
}

function forwardResponseHeaders(backendHeaders: Headers) {
  const forwarded = new Headers();

  for (const [key, value] of backendHeaders.entries()) {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      forwarded.set(key, value);
    }
  }

  return forwarded;
}

function isInfrastructureErrorResponse(response: Response) {
  if (!INFRA_ERROR_STATUS.has(response.status)) {
    return false;
  }

  const contentType = response.headers.get("content-type") ?? "";
  return !contentType.includes("application/json");
}

export async function proxyBackendRequest(
  request: NextRequest,
  path: string[]
): Promise<NextResponse> {
  let backendUrl: string;

  try {
    backendUrl = buildBackendUrl(path, request.nextUrl.searchParams);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Konfigurasi API_URL belum tersedia.",
      },
      { status: 503 }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers: forwardRequestHeaders(request.headers),
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
      signal: controller.signal,
      // @ts-expect-error duplex diperlukan untuk streaming request body di Node.js fetch
      duplex: "half",
    });

    if (isInfrastructureErrorResponse(backendResponse)) {
      return NextResponse.json(
        {
          success: false,
          error: "Layanan sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        },
        { status: 502 }
      );
    }

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: forwardResponseHeaders(backendResponse.headers),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          error: "Waktu tunggu habis. Silakan coba beberapa saat lagi.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Layanan sedang tidak tersedia. Silakan coba beberapa saat lagi.",
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
