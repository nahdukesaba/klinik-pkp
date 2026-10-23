export interface AdminDirectoryIdentity {
  appUserId: string;
}

export function adaptAdminDirectoryIdentity(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const appUserId =
    typeof record.appUserId === "string" && record.appUserId.trim()
      ? record.appUserId.trim()
      : null;
  if (!appUserId) {
    return null;
  }

  return {
    appUserId,
  } satisfies AdminDirectoryIdentity;
}

export function getAdminDirectoryRouteId(user: AdminDirectoryIdentity) {
  return user.appUserId;
}
