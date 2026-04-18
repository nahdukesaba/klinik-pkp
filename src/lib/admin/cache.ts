import { revalidateTag, unstable_cache } from "next/cache";

export const ADMIN_CACHE_TAGS = {
  auditLog: "admin-audit-log",
  dashboardOverview: "admin-dashboard-overview",
  externalStats: "admin-external-stats",
  usersDirectory: "admin-users-directory",
} as const;

export function createCachedAdminReader<Args extends unknown[], Result>(
  key: string,
  reader: (...args: Args) => Promise<Result>,
  options: {
    revalidate: number;
    tags: readonly string[];
  }
) {
  return unstable_cache(reader, [key], {
    revalidate: options.revalidate,
    tags: [...options.tags],
  });
}

export function revalidateAdminTag(tag: string) {
  revalidateTag(tag, "max");
}

export function revalidateAdminTags(tags: readonly string[]) {
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
