import "server-only";

import { extractApiCollectionItems, extractApiPaginationMeta, type ApiResponse } from "@/lib/api-client";
import { sanitizeEmail, sanitizeInput, sanitizeNip } from "@/lib/security";
import type { AdminDirectoryUser, AdminPaginatedUsers, AdminPaginationMeta, MembershipStatus, UserRole } from "@/types/admin";
import type { SortDirection } from "@/types/api";

import { BackendApiError, fetchBackendJson } from "./backend-api";
import { normalizeDisplayName } from "./service";
import { adaptAdminDirectoryIdentity } from "./user-contract";

interface BackendUserRecord {
  appUserId: string;
  authUserId?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  nip?: string | null;
  nik?: string | null;
  alamat?: string | null;
  gelarDepan?: string | null;
  gelarBelakang?: string | null;
  role: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminUserMutationInput {
  fullName: string;
  email: string;
  phone?: string;
  nip?: string;
  nik?: string;
  alamat?: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  role: UserRole;
  status: MembershipStatus;
}
export type AdminUserUpdateInput = Omit<AdminUserMutationInput, "email">;

export const ADMIN_USERS_PAGE_LIMIT = 50;
const USER_SORT_FIELDS = new Set(["full_name", "email", "role", "status", "created_at", "updated_at"]);
const MEMBERSHIP_STATUSES = new Set<MembershipStatus>(["pending", "approved", "rejected", "disabled"]);

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function normalizePhone(value?: string | null) { return sanitizeInput(value ?? "").replace(/[^\d+\-\s()]/g, "").trim(); }
function nullable(value?: string | null) { const result = sanitizeInput(value ?? "").trim(); return result || null; }
function normalizeRole(value: string): UserRole { return value.trim().toLowerCase() === "admin" ? "admin" : "user"; }
function normalizeStatus(value: string): MembershipStatus {
  const status = value.trim().toLowerCase() as MembershipStatus;
  if (!MEMBERSHIP_STATUSES.has(status)) throw new BackendApiError("Status membership pengguna tidak valid.", 502);
  return status;
}
function positive(value: number | undefined, fallback: number) { return value !== undefined && Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : fallback; }
function page(value?: number) { return positive(value, 1); }
function limit(value?: number) { return Math.min(ADMIN_USERS_PAGE_LIMIT, positive(value, ADMIN_USERS_PAGE_LIMIT)); }

function toDirectoryUser(user: BackendUserRecord): AdminDirectoryUser {
  const identity = adaptAdminDirectoryIdentity(user);
  if (!identity) throw new BackendApiError("Identitas canonical pengguna tidak valid.", 502);
  return {
    ...identity,
    authUserId: nullable(user.authUserId),
    fullName: normalizeDisplayName(user.fullName),
    email: sanitizeEmail(user.email),
    phone: nullable(normalizePhone(user.phone)),
    nip: user.nip ? sanitizeNip(user.nip) : null,
    nik: nullable(user.nik), alamat: nullable(user.alamat),
    gelarDepan: nullable(user.gelarDepan), gelarBelakang: nullable(user.gelarBelakang),
    role: normalizeRole(user.role), status: normalizeStatus(user.status),
    createdAt: typeof user.createdAt === "string" ? user.createdAt : undefined,
    updatedAt: typeof user.updatedAt === "string" ? user.updatedAt : undefined,
  };
}

function paginationMeta(count: number, meta: ReturnType<typeof extractApiPaginationMeta>): AdminPaginationMeta {
  const pageLimit = limit(meta.limit); const totalRecords = Math.max(0, meta.totalRecords ?? count);
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageLimit)); const currentPage = Math.min(page(meta.page), totalPages);
  return { totalRecords, page: currentPage, limit: pageLimit, totalPages, hasNextPage: currentPage < totalPages, hasPreviousPage: currentPage > 1 };
}

function endpoint(options?: { page?: number; limit?: number; keyword?: string; sortBy?: string | null; sortDirection?: SortDirection; role?: UserRole; status?: MembershipStatus }) {
  const params = new URLSearchParams({ page: String(page(options?.page)), limit: String(limit(options?.limit)) });
  const keyword = sanitizeInput(options?.keyword ?? "").trim(); if (keyword) params.set("keyword", keyword);
  const sortBy = sanitizeInput(options?.sortBy ?? "").trim(); if (USER_SORT_FIELDS.has(sortBy)) { params.set("sort_by", sortBy); if (options?.sortDirection) params.set("sort_order", options.sortDirection); }
  if (options?.role) params.set("role", options.role); if (options?.status) params.set("status", options.status);
  return `users?${params.toString()}`;
}

function requireToken(token?: string) { if (!token) throw new BackendApiError("Sesi admin tidak tersedia. Silakan login ulang.", 503); return token; }
function headers(token: string, extra?: HeadersInit) { return { Authorization: `Bearer ${token}`, ...extra }; }

export async function listUsersPage(backendAccessToken?: string, options?: { page?: number; limit?: number; keyword?: string; sortBy?: string | null; sortDirection?: SortDirection; role?: UserRole; status?: MembershipStatus }): Promise<AdminPaginatedUsers> {
  const payload = await fetchBackendJson<ApiResponse<unknown>>(endpoint(options), { headers: headers(requireToken(backendAccessToken)), timeoutMs: 20_000 });
  const items = extractApiCollectionItems<BackendUserRecord>(payload.data);
  if (!payload.success || !items) throw new BackendApiError(payload.message || "Format data pengguna dari backend tidak valid.", 502, payload.details);
  return { items: items.map(toDirectoryUser), meta: paginationMeta(items.length, extractApiPaginationMeta(payload.data)) };
}

export async function getUserDetail(appUserId: string, backendAccessToken?: string) {
  const payload = await fetchBackendJson<ApiResponse<unknown>>(`users/${appUserId}`, { headers: headers(requireToken(backendAccessToken)), timeoutMs: 15_000 });
  if (!payload.success || !isRecord(payload.data)) throw new BackendApiError(payload.message || "Format detail pengguna dari backend tidak valid.", 502, payload.details);
  return toDirectoryUser(payload.data as unknown as BackendUserRecord);
}

function mutation(input: AdminUserMutationInput | AdminUserUpdateInput) {
  return { fullName: normalizeDisplayName(input.fullName), ...( "email" in input ? { email: sanitizeEmail(input.email) } : {}), phone: normalizePhone(input.phone), nip: sanitizeNip(input.nip ?? ""), nik: nullable(input.nik) ?? "", alamat: nullable(input.alamat) ?? "", gelarDepan: nullable(input.gelarDepan) ?? "", gelarBelakang: nullable(input.gelarBelakang) ?? "", role: input.role, status: input.status };
}

export async function createUser(input: AdminUserMutationInput, backendAccessToken?: string) {
  return fetchBackendJson<ApiResponse<unknown>>("users", { method: "POST", headers: headers(requireToken(backendAccessToken), { "Content-Type": "application/json" }), body: JSON.stringify(mutation(input)), timeoutMs: 20_000 });
}
export async function updateUser(appUserId: string, input: AdminUserUpdateInput, backendAccessToken?: string) {
  return fetchBackendJson<ApiResponse<unknown>>(`users/${appUserId}`, { method: "PUT", headers: headers(requireToken(backendAccessToken), { "Content-Type": "application/json" }), body: JSON.stringify(mutation(input)), timeoutMs: 20_000 });
}
export async function deleteUser(appUserId: string, backendAccessToken?: string) {
  return fetchBackendJson<ApiResponse<unknown>>(`users/${appUserId}`, { method: "DELETE", headers: headers(requireToken(backendAccessToken)), timeoutMs: 20_000 });
}
