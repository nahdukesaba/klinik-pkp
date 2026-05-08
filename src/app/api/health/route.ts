import { createJsonResponse } from "@/lib/server/http";

/**
 * Health Check API
 *
 * GET /api/health — Status aplikasi (hanya informasi non-sensitif).
 */
export async function GET() {
  return createJsonResponse({ status: "ok" });
}
