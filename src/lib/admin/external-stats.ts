import "server-only";

import {
  extractApiCollectionItems,
  extractApiPaginationMeta,
  type ApiResponse,
} from "@/types/api";

import {
  ADMIN_CACHE_TAGS,
  createCachedAdminReader,
} from "./cache";
import { fetchBackendJson, getBackendApiBaseUrl } from "./backend-api";

interface ExternalStatsSummary {
  totalBsps: number;
  totalRusun: number;
  totalKumuh: number;
  totalSosialisasi: number;
  totalBankDesain: number;
  failedResources: string[];
}

const EXTERNAL_STATS_RESOURCES = [
  {
    key: "totalBsps",
    label: "BSPS",
    path: "bsps",
  },
  {
    key: "totalRusun",
    label: "Rusun",
    path: "rusun",
  },
  {
    key: "totalKumuh",
    label: "Kawasan Kumuh",
    path: "kumuh",
  },
  {
    key: "totalSosialisasi",
    label: "Sosialisasi",
    path: "sosialisasi",
  },
  {
    key: "totalBankDesain",
    label: "Bank Desain",
    path: "bank-desain",
  },
] as const;

type ExternalStatsKey = (typeof EXTERNAL_STATS_RESOURCES)[number]["key"];

async function fetchExternalCollectionCount(path: string) {
  const payload = await fetchBackendJson<ApiResponse<unknown>>(path);
  const items = extractApiCollectionItems(payload.data);
  const meta = extractApiPaginationMeta(payload.data);

  if (!payload.success || !items) {
    throw new Error(payload.message ?? "Format data dari backend tidak valid.");
  }

  return meta.totalRecords ?? items.length;
}

async function readExternalDashboardStats(): Promise<ExternalStatsSummary> {
  const summary: ExternalStatsSummary = {
    totalBsps: 0,
    totalRusun: 0,
    totalKumuh: 0,
    totalSosialisasi: 0,
    totalBankDesain: 0,
    failedResources: [],
  };

  try {
    getBackendApiBaseUrl();
  } catch {
    summary.failedResources.push("Konfigurasi API");
    return summary;
  }

  const results = await Promise.allSettled(
    EXTERNAL_STATS_RESOURCES.map(async (resource) => ({
      key: resource.key,
      label: resource.label,
      count: await fetchExternalCollectionCount(resource.path),
    }))
  );

  for (const [index, result] of results.entries()) {
    if (result.status === "fulfilled") {
      summary[result.value.key as ExternalStatsKey] = result.value.count;
      continue;
    }

    summary.failedResources.push(EXTERNAL_STATS_RESOURCES[index].label);
  }

  return summary;
}

const getCachedExternalDashboardStats = createCachedAdminReader(
  "admin-external-stats",
  readExternalDashboardStats,
  {
    revalidate: 60,
    tags: [ADMIN_CACHE_TAGS.externalStats],
  }
);

export async function getExternalDashboardStats(): Promise<ExternalStatsSummary> {
  return getCachedExternalDashboardStats();
}
