/**
 * Logout API Route
 *
 * Menghapus token dari httpOnly cookies.
 * POST /api/auth/logout
 */

import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Hapus access token cookie
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire segera
  });

  // Hapus refresh token cookie
  response.cookies.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });

  return response;
}
