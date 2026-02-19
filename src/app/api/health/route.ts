import { NextResponse } from "next/server";

/**
 * Health Check API
 * 
 * Endpoint untuk memeriksa status aplikasi.
 * Tidak mengekspos informasi sensitif tentang server.
 * 
 * GET /api/health
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    // Hanya tampilkan informasi non-sensitif
    // JANGAN tampilkan: server version, OS info, dependency versions
  });
}
