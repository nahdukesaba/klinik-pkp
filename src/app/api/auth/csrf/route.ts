import { NextResponse } from "next/server";

import { attachCsrfCookie, createCsrfToken } from "@/lib/admin/security";

export async function GET() {
  const token = createCsrfToken();
  const response = NextResponse.json({ csrfToken: token });

  response.headers.set("Cache-Control", "no-store");

  return attachCsrfCookie(response, token);
}
