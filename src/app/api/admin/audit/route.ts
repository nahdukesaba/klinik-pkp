import { NextRequest, NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin/security";
import { listAuditEntries } from "@/lib/admin/service";

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { roles: ["admin"] });
  if (!auth.ok) {
    return auth.response;
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Number(limitParam || "20");
  const audit = await listAuditEntries(Number.isFinite(limit) ? limit : 20);

  return NextResponse.json({ data: audit });
}
