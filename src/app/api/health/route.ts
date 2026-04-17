import { NextResponse } from "next/server";

/**
 * Health Check API
 *
 * GET /api/health — Status aplikasi (hanya informasi non-sensitif).
 */
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
