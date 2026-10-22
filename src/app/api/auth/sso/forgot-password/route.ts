import { NextResponse } from "next/server";

import { getSsoPublicPageUrl } from "@/lib/server/sso-auth";

export async function GET(request: Request) {
  try {
    return NextResponse.redirect(getSsoPublicPageUrl("forgot-password"), 307);
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=recovery_unavailable", request.url),
      307,
    );
  }
}
