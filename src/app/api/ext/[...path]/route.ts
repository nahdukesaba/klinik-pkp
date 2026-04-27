import "server-only";

import { type NextRequest } from "next/server";

import { proxyBackendRequest } from "@/lib/server/backend-proxy";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyBackendRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyBackendRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyBackendRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyBackendRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyBackendRequest(request, path);
}
