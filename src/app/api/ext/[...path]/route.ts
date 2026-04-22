import "server-only";

import { type NextRequest, NextResponse } from "next/server";

import {
  normalizeBackendPathname,
  requireBackendApiBaseUrl,
} from "@/lib/server/backend-config";

/**
 * Catch-all proxy: /api/ext/* -> Backend API.
 *
 * Kenapa pakai route handler, bukan next.config rewrite?
 * - Rewrite bawaan mengembalikan 404 mentah saat backend tidak aktif.
 * - Route handler ini bisa mengembalikan 502 yang lebih akurat.
 * - Error dari reverse proxy atau network layer bisa dinormalisasi
 *   sebelum diteruskan ke browser.
 *
 * Alur: Browser -> /api/ext/rusun -> handler ini -> API_URL/rusun
 */

/** Batas waktu koneksi ke backend (milidetik) */
const BACKEND_TIMEOUT_MS = 30_000;

/**
 * Status HTTP dari infrastruktur perantara, bukan dari API kita.
 * Umum muncul saat reverse proxy, load balancer, atau upstream sedang gagal.
 */
const INFRA_ERROR_STATUS = new Set([404, 502, 503, 520, 521, 522, 523, 524]);

/**
 * Header request yang memang perlu diteruskan ke backend publik.
 *
 * Penting: jangan forward cookie/session header browser ke backend publik.
 * Setelah login admin di frontend, cookie Next.js bisa menjadi cukup besar
 * dan memicu 431 "Request Header Fields Too Large" di upstream backend.
 */
const ALLOWED_REQUEST_HEADERS = new Set([
  "accept",
  "content-type",
  "if-none-match",
  "if-modified-since",
  "if-range",
  "range",
]);

/** Header response yang tidak diteruskan ke browser */
const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "transfer-encoding",
  "connection",
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

/**
 * Deteksi apakah response berasal dari infrastruktur perantara,
 * bukan dari API backend kita sendiri.
 */
function isInfrastructureErrorResponse(response: Response) {
  if (!INFRA_ERROR_STATUS.has(response.status)) {
    return false;
  }

  const contentType = response.headers.get("content-type") ?? "";
  return !contentType.includes("application/json");
}

async function proxyToBackend(
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}
