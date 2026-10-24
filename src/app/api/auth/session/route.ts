import { NextResponse } from "next/server";

import { getAuthenticatedSessionUserFromCookies } from "@/lib/server/auth-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedSessionUserFromCookies();

  return NextResponse.json(
    {
      success: true,
      data: {
        authenticated: Boolean(user),
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
