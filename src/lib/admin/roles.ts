import type { UserRole } from "@/types/admin";

export const ADMIN_PANEL_ROLES = ["admin"] as const satisfies readonly UserRole[];
export const ADMIN_CONTENT_ROLES = ["admin"] as const satisfies readonly UserRole[];
export const ADMIN_ONLY_ROLES = ["admin"] as const satisfies readonly UserRole[];

const ADMIN_PANEL_ROLE_SET = new Set<UserRole>(ADMIN_PANEL_ROLES);

export function isAdminPanelRole(role: string): role is UserRole {
  return ADMIN_PANEL_ROLE_SET.has(role as UserRole);
}

export function canManageUsers(role: UserRole) {
  return role === "admin";
}

export function canManageContent(role: UserRole) {
  return role === "admin";
}

export function canAccessAdminRole(
  role: UserRole,
  allowedRoles?: readonly UserRole[]
) {
  return !allowedRoles || allowedRoles.includes(role);
}

export function normalizeAdminRole(role: string | null | undefined): UserRole | null {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toLowerCase();
  if (normalized === "admin" || normalized === "administrator") {
    return "admin";
  }
  if (normalized === "user" || normalized === "users" || normalized === "member") {
    return "user";
  }

  return null;
}
