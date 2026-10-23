export interface AdminDirectoryIdentity {
  legacyLocalUserId: string;
  appUserId: string | null;
}

export function adaptAdminDirectoryIdentity(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const legacyLocalUserId =
    typeof record.id === "string" && record.id.trim()
      ? record.id.trim()
      : null;
  if (!legacyLocalUserId) {
    return null;
  }

  return {
    legacyLocalUserId,
    appUserId:
      typeof record.appUserId === "string" && record.appUserId.trim()
        ? record.appUserId.trim()
        : null,
  } satisfies AdminDirectoryIdentity;
}

export function getAdminDirectoryRouteId(user: AdminDirectoryIdentity) {
  return user.legacyLocalUserId;
}
