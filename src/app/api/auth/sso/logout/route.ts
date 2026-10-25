import { NextResponse } from "next/server";

import { getKlinikBrowserSsoLogoutUrl } from "@/lib/server/klinik-browser-sso";

export async function GET(request: Request) {
  try {
    const cancelReturn = new URL(request.url).searchParams.get("cancel_return") ?? undefined;
    return NextResponse.redirect(getKlinikBrowserSsoLogoutUrl(cancelReturn), 307);
  } catch {
    return NextResponse.redirect(new URL("/login", request.url), 307);
  }
}
