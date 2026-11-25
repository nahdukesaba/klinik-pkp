import { NextResponse } from "next/server";

import { buildTrustedServiceUrl } from "@/lib/auth/browser-sso-contract";

export const dynamic = "force-dynamic";

export async function GET() {
  const ssoBase = (process.env.SSO_BASE_URL?.trim() || "http://localhost:8082").replace(/\/+$/, "");
  try {
    const response = await fetch(
      buildTrustedServiceUrl(ssoBase, "widget/app-switcher.js"),
      {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (response.ok) {
      const script = await response.text();
      return new NextResponse(script, {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }
  } catch {
    // Fallback below
  }
  return new NextResponse("/* widget unavailable */", {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
