"use client";

import { getApiPayloadData } from "@/lib/api-response";
import { AUTH_ENDPOINTS } from "@/services/auth-endpoints";

export async function fetchAdminCsrfToken() {
  const response = await fetch(AUTH_ENDPOINTS.csrf, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  const data = getApiPayloadData(payload);
  const csrfToken =
    data && typeof data === "object" && "csrfToken" in data
      ? data.csrfToken
      : undefined;

  if (!response.ok || typeof csrfToken !== "string") {
    throw new Error("Gagal memuat token keamanan.");
  }

  return csrfToken;
}

export async function refreshAdminSessionToken() {
  return fetch(AUTH_ENDPOINTS.refresh, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  })
    .then((response) => response.ok)
    .catch(() => false);
}
