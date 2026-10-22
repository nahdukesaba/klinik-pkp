import { NextResponse } from "next/server";

import { getKlinikBrowserSsoStartUrl } from "@/lib/server/klinik-browser-sso";

export async function GET(request: Request) {
  try {
    return NextResponse.redirect(getKlinikBrowserSsoStartUrl(), 307);
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=sso_unavailable", request.url),
      307,
    );
  }
}
