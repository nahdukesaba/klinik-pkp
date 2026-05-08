import { NextRequest } from "next/server";

import { handleListAuditEntries } from "@/lib/admin/route-handlers";

export async function GET(request: NextRequest) {
  return handleListAuditEntries(request);
}
