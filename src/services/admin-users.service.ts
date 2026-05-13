"use client";

import { adminFetch } from "@/lib/admin-client";
import { buildApiEndpoint } from "@/lib/api-client";
import type {
  AdminDirectoryUser,
  AdminPaginationMeta,
  AuditEntry,
  UserRole,
} from "@/types/admin";
import type { ApiListQueryControls } from "@/types/api";

const ADMIN_USERS_ENDPOINT = "/api/admin/users";
const ADMIN_AUDIT_ENDPOINT = "/api/admin/audit";

export interface ControlUserPayload {
  name: string;
  phone: string;
}

export interface ControlUserCreatePayload extends ControlUserPayload {
  email: string;
  nip: string;
  role: UserRole;
  isActive: boolean;
  password: string;
}

export interface AdminUsersPageResponse {
  data: AdminDirectoryUser[];
  meta: AdminPaginationMeta;
}

export async function fetchAdminUsersPage(
  params: ApiListQueryControls & { limit: number }
) {
  return adminFetch<AdminUsersPageResponse>(
    buildApiEndpoint(ADMIN_USERS_ENDPOINT, {
      page: params.page,
      limit: params.limit,
      keyword: params.keyword,
      sort_by: params.sortBy,
      sort_order: params.sortBy ? params.sortDirection : undefined,
    })
  );
}

export async function fetchAdminAuditEntries(params: { limit: number }) {
  const response = await adminFetch<{ data: AuditEntry[] }>(
    buildApiEndpoint(ADMIN_AUDIT_ENDPOINT, params)
  );

  return response.data;
}

export async function fetchAdminUserDetail(id: string) {
  const response = await adminFetch<{ data: AdminDirectoryUser }>(
    `${ADMIN_USERS_ENDPOINT}/${id}`
  );

  return response.data;
}

export async function createAdminUser(payload: ControlUserCreatePayload) {
  return adminFetch(ADMIN_USERS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(id: string, payload: ControlUserPayload) {
  return adminFetch(`${ADMIN_USERS_ENDPOINT}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(id: string) {
  return adminFetch(`${ADMIN_USERS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
}
