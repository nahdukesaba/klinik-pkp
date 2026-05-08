import "server-only";

import {
  extractApiCollectionItems,
  extractApiPaginationMeta,
  type ApiResponse,
} from "@/lib/api-client";
import { sanitizeEmail, sanitizeInput, sanitizeNip } from "@/lib/security";
import type {
  AdminDirectoryUser,
  AdminPaginatedUsers,
  AdminPaginationMeta,
  UserRole,
} from "@/types/admin";

import { BackendApiError, fetchBackendJson } from "./backend-api";
import { normalizeDisplayName } from "./service";

interface BackendUserRecord {
  id: string;
  name: string;
  email: string;
  nip?: string | null;
  phone?: string | null;
  role: string;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminUserMutationInput {
  name: string;
  email: string;
  nip: string;
  password?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
}

export const ADMIN_USERS_PAGE_LIMIT = 10;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePhone(value: string | null | undefined) {
  return sanitizeInput(value ?? "").replace(/[^\d+\-\s()]/g, "").trim();
}

function normalizeDirectoryRole(role: string): UserRole {
  return role.trim().toLowerCase() === "admin" ? "admin" : "user";
}

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(value));
}

function normalizeUsersPage(page?: number) {
  return normalizePositiveInteger(page, 1);
}

function normalizeUsersLimit(limit?: number) {
  return Math.min(
    ADMIN_USERS_PAGE_LIMIT,
    normalizePositiveInteger(limit, ADMIN_USERS_PAGE_LIMIT)
  );
}

function toDirectoryUser(user: BackendUserRecord): AdminDirectoryUser {
  return {
    id: user.id,
    name: normalizeDisplayName(user.name),
    email: sanitizeEmail(user.email),
    nip: user.nip ? sanitizeNip(user.nip) : undefined,
    phone: normalizePhone(user.phone),
    role: normalizeDirectoryRole(user.role),
    isActive: Boolean(user.is_active),
    createdAt: typeof user.created_at === "string" ? user.created_at : undefined,
    updatedAt: typeof user.updated_at === "string" ? user.updated_at : undefined,
  };
}

function buildUsersPaginationMeta(
  fallbackCount: number,
  meta: ReturnType<typeof extractApiPaginationMeta>
): AdminPaginationMeta {
  const limit = normalizeUsersLimit(meta.limit);
  const totalRecords = Math.max(0, meta.totalRecords ?? fallbackCount);
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const page = Math.min(normalizeUsersPage(meta.page), totalPages);

  return {
    totalRecords,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function buildUsersEndpoint(page?: number, limit?: number) {
  const params = new URLSearchParams();
  const normalizedPage = normalizeUsersPage(page);
  const normalizedLimit = normalizeUsersLimit(limit);

  params.set("page", String(normalizedPage));
  params.set("limit", String(normalizedLimit));

  return `users?${params.toString()}`;
}

function createAuthorizedHeaders(backendAccessToken: string, headers?: HeadersInit) {
  return {
    Authorization: `Bearer ${backendAccessToken}`,
    ...headers,
  };
}

function requireBackendAccessToken(backendAccessToken?: string) {
  if (!backendAccessToken) {
    throw new BackendApiError(
      "Sesi admin tidak tersedia. Silakan login ulang.",
      503
    );
  }

  return backendAccessToken;
}

export async function listUsersPage(
  backendAccessToken?: string,
  options?: {
    page?: number;
    limit?: number;
  }
): Promise<AdminPaginatedUsers> {
  const accessToken = requireBackendAccessToken(backendAccessToken);

  const payload = await fetchBackendJson<ApiResponse<unknown>>(
    buildUsersEndpoint(options?.page, options?.limit),
    {
      headers: createAuthorizedHeaders(accessToken),
      timeoutMs: 20_000,
    }
  );
  const items = extractApiCollectionItems<BackendUserRecord>(payload.data);

  if (!payload.success || !items) {
    throw new BackendApiError(
      payload.message || "Format data pengguna dari backend tidak valid.",
      502,
      payload.details
    );
  }

  return {
    items: items.map(toDirectoryUser),
    meta: buildUsersPaginationMeta(items.length, extractApiPaginationMeta(payload.data)),
  };
}

export async function getUserDetail(
  id: string,
  backendAccessToken?: string
) {
  const accessToken = requireBackendAccessToken(backendAccessToken);

  const payload = await fetchBackendJson<ApiResponse<unknown>>(`users/${id}`, {
    headers: createAuthorizedHeaders(accessToken),
    timeoutMs: 15_000,
  });

  if (!payload.success || !isRecord(payload.data)) {
    throw new BackendApiError(
      payload.message || "Format detail pengguna dari backend tidak valid.",
      502,
      payload.details
    );
  }

  return toDirectoryUser(payload.data as unknown as BackendUserRecord);
}

function buildUserMutationPayload(input: AdminUserMutationInput) {
  const payload: Record<string, unknown> = {
    name: normalizeDisplayName(input.name),
    email: sanitizeEmail(input.email),
    nip: sanitizeNip(input.nip),
    phone: normalizePhone(input.phone),
    role: input.role,
    is_active: input.isActive,
  };

  if (input.password && input.password.trim() !== "") {
    payload.password = input.password;
  }

  return payload;
}

export async function createUser(
  input: AdminUserMutationInput,
  backendAccessToken?: string
) {
  const accessToken = requireBackendAccessToken(backendAccessToken);

  return fetchBackendJson<ApiResponse<unknown>>("users", {
    method: "POST",
    headers: createAuthorizedHeaders(accessToken, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(buildUserMutationPayload(input)),
    timeoutMs: 20_000,
  });
}

export async function updateUser(
  id: string,
  input: AdminUserMutationInput,
  backendAccessToken?: string
) {
  const accessToken = requireBackendAccessToken(backendAccessToken);

  return fetchBackendJson<ApiResponse<unknown>>(`users/${id}`, {
    method: "PUT",
    headers: createAuthorizedHeaders(accessToken, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(buildUserMutationPayload(input)),
    timeoutMs: 20_000,
  });
}

export async function deleteUser(
  id: string,
  backendAccessToken?: string
) {
  const accessToken = requireBackendAccessToken(backendAccessToken);

  return fetchBackendJson<ApiResponse<unknown>>(`users/${id}`, {
    method: "DELETE",
    headers: createAuthorizedHeaders(accessToken),
    timeoutMs: 20_000,
  });
}
