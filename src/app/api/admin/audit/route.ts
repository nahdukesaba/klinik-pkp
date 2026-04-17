import { NextRequest, NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin/security";
import { listAuditEntries } from "@/lib/admin/service";

function parseAuditLimit(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(100, Math.max(1, Math.trunc(parsed)));
}

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { roles: ["admin"] });
  if (!auth.ok) {
    return auth.response;
  }

  const limit = parseAuditLimit(request.nextUrl.searchParams.get("limit"), 20);
  const audit = await listAuditEntries(limit);

  return NextResponse.json({ data: audit });
}
