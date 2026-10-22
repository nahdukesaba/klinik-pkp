import { NextResponse } from "next/server";

import { getKlinikBrowserSsoLogoutUrl } from "@/lib/server/klinik-browser-sso";

export async function GET(request: Request) {
  try {
    return NextResponse.redirect(getKlinikBrowserSsoLogoutUrl(), 307);
  } catch {
    return NextResponse.redirect(new URL("/login", request.url), 307);
  }
}
