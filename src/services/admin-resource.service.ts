"use client";

import { adminFetch } from "@/lib/admin-client";

export const ADMIN_RESOURCE_NAMES = {
  faq: "faq",
  bsps: "bsps",
  kumuh: "kumuh",
  rusun: "rusun",
  bankDesain: "bank-desain",
  sosialisasi: "sosialisasi",
} as const;

export type AdminResourceName =
  (typeof ADMIN_RESOURCE_NAMES)[keyof typeof ADMIN_RESOURCE_NAMES];

const ADMIN_RESOURCE_ENDPOINTS: Record<AdminResourceName, string> = {
  faq: "/api/admin/resources/faq",
  bsps: "/api/admin/resources/bsps",
  kumuh: "/api/admin/resources/kumuh",
  rusun: "/api/admin/resources/rusun",
  "bank-desain": "/api/admin/resources/bank-desain",
  sosialisasi: "/api/admin/resources/sosialisasi",
};

function getAdminResourceEndpoint(resource: AdminResourceName, id?: string | number) {
  const baseEndpoint = ADMIN_RESOURCE_ENDPOINTS[resource];
  return id == null ? baseEndpoint : `${baseEndpoint}/${id}`;
}

function buildAdminMutationRequest(payload: unknown | FormData, method: "POST" | "PUT") {
  const request: RequestInit = {
    method,
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  };

  if (!(payload instanceof FormData)) {
    request.headers = { "Content-Type": "application/json" };
  }

  return request;
}

export async function createAdminResource(
  resource: AdminResourceName,
  payload: unknown | FormData
) {
  return adminFetch(getAdminResourceEndpoint(resource), buildAdminMutationRequest(payload, "POST"));
}

export async function updateAdminResource(
  resource: AdminResourceName,
  id: string | number,
  payload: unknown | FormData
) {
  return adminFetch(
    getAdminResourceEndpoint(resource, id),
    buildAdminMutationRequest(payload, "PUT")
  );
}

export async function deleteAdminResource(
  resource: AdminResourceName,
  id: string | number
) {
  return adminFetch(getAdminResourceEndpoint(resource, id), {
    method: "DELETE",
  });
}
