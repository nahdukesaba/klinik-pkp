import "server-only";

import { sanitizeEmail, sanitizeInput, sanitizeNip } from "@/lib/security";
import type {
  AuditEntry,
  DashboardStats,
  RecentActivity,
} from "@/types/admin";

import { appendAuditEntry, listStoredAuditEntries } from "./audit-log";
import {
  ADMIN_CACHE_TAGS,
  createCachedAdminReader,
  revalidateAdminTags,
} from "./cache";
import {
  normalizeAdminRole,
  type AdminSessionUser,
} from "./security";
import { listUsersPage } from "./users";

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function normalizeDisplayName(value: string) {
  const sanitized = sanitizeInput(value).replace(/\s+/g, " ").trim();
  return sanitized || "Admin PKP";
}

function toRecentActivity(entry: AuditEntry): RecentActivity {
  const action = entry.action.toLowerCase();

  return {
    id: entry.id,
    action:
      action === "create" ||
      action === "update" ||
      action === "delete" ||
      action === "login"
        ? action
        : "update",
    module: entry.module,
    description: entry.details,
    user: entry.userName,
    timestamp: entry.timestamp,
  };
}

export function createSessionAdminUser(user: {
  id?: string;
  email: string;
  nip: string;
  name: string;
  role: string;
}) {
  const normalizedRole = normalizeAdminRole(user.role);
  if (normalizedRole !== "admin") {
    throw new Error("Akun tidak memiliki akses ke dashboard admin.");
  }

  return {
    id: user.id ?? createId("usr"),
    name: normalizeDisplayName(user.name),
    email: sanitizeEmail(user.email),
    nip: sanitizeNip(user.nip),
    role: normalizedRole,
  } satisfies AdminSessionUser;
}

export async function createAuditEntry(params: {
  action: string;
  module: string;
  details: string;
  actor: Pick<AdminSessionUser, "id" | "name">;
  ipAddress: string;
}) {
  const entry: AuditEntry = {
    id: createId("audit"),
    userId: params.actor.id,
    userName: params.actor.name,
    action: params.action.toUpperCase(),
    module: params.module,
    details: sanitizeInput(params.details),
    ipAddress: sanitizeInput(params.ipAddress) || "unknown",
    timestamp: nowIso(),
  };

  await appendAuditEntry(entry);
  revalidateAdminTags([
    ADMIN_CACHE_TAGS.auditLog,
    ADMIN_CACHE_TAGS.dashboardOverview,
  ]);
}

export async function recordSuccessfulLogin(
  user: Pick<AdminSessionUser, "id" | "name">,
  ipAddress: string
) {
  await createAuditEntry({
    action: "LOGIN",
    module: "Auth",
    details: "Login berhasil ke dashboard admin.",
    actor: user,
    ipAddress,
  });
}

export async function listAuditEntries(limit = 20) {
  return listStoredAuditEntries(limit);
}

async function readDashboardOverview(options?: {
  includeAudit?: boolean;
  backendAccessToken?: string;
  origin?: string;
}) {
  const includeAudit = options?.includeAudit ?? true;

  const [usersPage, auditEntries] = await Promise.all([
    listUsersPage(options?.backendAccessToken, options?.origin, {
      page: 1,
    }).catch(() => ({
      items: [],
      meta: {
        totalRecords: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })),
    includeAudit ? listStoredAuditEntries(50) : Promise.resolve([]),
  ]);

  const stats: DashboardStats = {
    totalUsers: usersPage.meta.totalRecords,
    usersLoaded: usersPage.items.length,
    adminUsersLoaded: usersPage.items.filter((item) => item.role === "admin")
      .length,
    totalRecordedActivities: auditEntries.length,
  };

  return {
    stats,
    usersPreview: usersPage.items.slice(0, 5),
    usersMeta: usersPage.meta,
    recentActivities: auditEntries.slice(0, 8).map(toRecentActivity),
  };
}

const getCachedDashboardOverview = createCachedAdminReader(
  "admin-dashboard-overview",
  readDashboardOverview,
  {
    revalidate: 60,
    tags: [
      ADMIN_CACHE_TAGS.dashboardOverview,
      ADMIN_CACHE_TAGS.usersDirectory,
      ADMIN_CACHE_TAGS.auditLog,
    ],
  }
);

export async function getDashboardOverview(options?: {
  includeAudit?: boolean;
  backendAccessToken?: string;
  origin?: string;
}) {
  return getCachedDashboardOverview(options);
}
