export const ADMIN_STATE_TAGS = {
  auditLog: "admin-audit-log",
  dashboardOverview: "admin-dashboard-overview",
  externalStats: "admin-external-stats",
  usersDirectory: "admin-users-directory",
} as const;

export function createAdminReader<Args extends unknown[], Result>(
  _key: string,
  reader: (...args: Args) => Promise<Result>,
  _options: {
    revalidate: number;
    tags: readonly string[];
  }
) {
  return reader;
}

export function markAdminStateChanged(_tag: string) {
  // State admin dibaca ulang dari backend saat query berikutnya berjalan.
}

export function markAdminStatesChanged(tags: readonly string[]) {
  for (const tag of tags) {
    markAdminStateChanged(tag);
  }
}
