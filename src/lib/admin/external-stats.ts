import "server-only";

import {
  extractApiCollectionItems,
  extractApiPaginationMeta,
  type ApiResponse,
} from "@/lib/api-client";
import { getDateKey, getTodayDateKey } from "@/lib/date";

import { fetchBackendJson, getBackendApiBaseUrl } from "./backend-api";
import { ADMIN_STATE_TAGS, createAdminReader } from "./cache";

export interface ExternalStatsBreakdownItem {
  label: string;
  value: number;
}

export interface ExternalStatsWarning {
  label: string;
  value: number;
}

export interface ExternalStatsModuleSummary {
  key: ExternalStatsKey;
  label: string;
  totalRecords: number;
  loadedRecords: number;
  sampleLabel?: string;
  breakdown: ExternalStatsBreakdownItem[];
  warning?: ExternalStatsWarning;
}

export interface ExternalStatsSummary {
  totalFaqs: number;
  totalBsps: number;
  totalRusun: number;
  totalKumuh: number;
  totalSosialisasi: number;
  totalBankDesain: number;
  totalPublicRecords: number;
  modulesWithData: number;
  modulesWithWarnings: number;
  emptyModules: number;
  failedResources: string[];
  modules: ExternalStatsModuleSummary[];
}

const EXTERNAL_STATS_RESOURCES = [
  {
    key: "totalFaqs",
    label: "FAQ",
    path: "faqs",
  },
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

type ExternalStatsResource = (typeof EXTERNAL_STATS_RESOURCES)[number];
export type ExternalStatsKey = ExternalStatsResource["key"];

type ResourceItem = Record<string, unknown>;
interface ExternalStatsReadOptions {
  backendAccessToken?: string;
}

const EMPTY_TOTALS = {
  totalFaqs: 0,
  totalBsps: 0,
  totalRusun: 0,
  totalKumuh: 0,
  totalSosialisasi: 0,
  totalBankDesain: 0,
} satisfies Record<ExternalStatsKey, number>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getBooleanish(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "active", "aktif", "published", "yes"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "inactive", "nonaktif", "draft", "no"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}

function hasFiles(value: unknown) {
  return Array.isArray(value) && value.some((item) => typeof item === "string" && item.trim());
}

function hasValidCoordinate(item: ResourceItem) {
  const coordinate = item.coordinate;
  if (!isRecord(coordinate)) {
    return false;
  }

  const lat = getNumber(coordinate.latitude);
  const lng = getNumber(coordinate.longitude);

  return (
    lat != null &&
    lng != null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

function countByLabel(items: ResourceItem[], getLabel: (item: ResourceItem) => string) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const label = getLabel(item);
    if (!label) {
      continue;
    }

    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "id"))
    .slice(0, 4);
}

function deriveSlumLabel(item: ResourceItem) {
  const value = getNumber(item.slum_value) ?? 0;
  if (value >= 71) return "Kumuh Berat";
  if (value >= 40) return "Kumuh Sedang";
  return "Kumuh Ringan";
}

function deriveSosialisasiStatus(item: ResourceItem) {
  const endDate = getDateKey(getString(item.scheduled_at_end));
  const hasImages = hasFiles(item.image_urls);

  if (!endDate || endDate > getTodayDateKey()) {
    return "Mendatang";
  }

  return hasImages ? "Selesai" : "Perlu Dokumentasi";
}

function getSampleLabel(resource: ExternalStatsResource, items: ResourceItem[]) {
  const item = items[0];
  if (!item) {
    return undefined;
  }

  const label =
    resource.key === "totalFaqs"
      ? getString(item.question)
      : resource.key === "totalKumuh"
        ? getString(item.area_name)
        : resource.key === "totalBsps"
          ? getString(isRecord(item.village) ? item.village.name : undefined) ||
            getString(isRecord(item.region) ? item.region.name : undefined)
          : getString(item.name) || getString(item.title);

  return label || undefined;
}

function deriveBreakdown(resource: ExternalStatsResource, items: ResourceItem[]) {
  if (!items.length) {
    return [];
  }

  switch (resource.key) {
    case "totalFaqs":
      return countByLabel(items, (item) =>
        getBooleanish(item.is_active ?? item.isActive ?? item.active ?? item.status) === false
          ? "Nonaktif"
          : "Aktif"
      );
    case "totalBsps":
      return countByLabel(items, (item) => getString(item.status));
    case "totalRusun":
      return countByLabel(items, (item) => getString(item.unit_type));
    case "totalKumuh":
      return countByLabel(items, deriveSlumLabel);
    case "totalSosialisasi":
      return countByLabel(items, deriveSosialisasiStatus);
    case "totalBankDesain":
      return countByLabel(items, (item) => getString(item.type));
  }
}

function deriveWarning(resource: ExternalStatsResource, items: ResourceItem[]) {
  if (!items.length) {
    return undefined;
  }

  if (resource.key === "totalRusun") {
    const value = items.filter((item) => !hasFiles(item.image_urls)).length;
    return value > 0 ? { label: "Rusun tanpa gambar", value } : undefined;
  }

  if (resource.key === "totalBankDesain") {
    const value = items.filter(
      (item) => !hasFiles(item.image_urls) || !hasFiles(item.file_urls)
    ).length;
    return value > 0 ? { label: "Desain tanpa gambar/file", value } : undefined;
  }

  if (resource.key === "totalSosialisasi") {
    const value = items.filter(
      (item) => deriveSosialisasiStatus(item) === "Perlu Dokumentasi"
    ).length;
    return value > 0 ? { label: "Kegiatan perlu dokumentasi", value } : undefined;
  }

  if (resource.key === "totalBsps" || resource.key === "totalKumuh") {
    const value = items.filter((item) => !hasValidCoordinate(item)).length;
    return value > 0 ? { label: "Data tanpa koordinat valid", value } : undefined;
  }

  return undefined;
}

async function fetchExternalCollectionSnapshot(
  resource: ExternalStatsResource
) {
  const payload = await fetchBackendJson<ApiResponse<unknown>>(
    `${resource.path}?page=1&limit=10`,
    {
      retry: 4,
      timeoutMs: 30_000,
    }
  );
  const items = extractApiCollectionItems<ResourceItem>(payload.data);
  const dataMeta = extractApiPaginationMeta(payload.data);
  const responseMeta = extractApiPaginationMeta(payload.meta);
  const meta = {
    ...dataMeta,
    ...responseMeta,
  };

  if (!payload.success || !items) {
    throw new Error(payload.message ?? "Format data dari backend tidak valid.");
  }

  return {
    totalRecords: meta.totalRecords ?? items.length,
    items,
  };
}

function createModuleSummary(
  resource: ExternalStatsResource,
  totalRecords: number,
  items: ResourceItem[]
): ExternalStatsModuleSummary {
  return {
    key: resource.key,
    label: resource.label,
    totalRecords,
    loadedRecords: items.length,
    sampleLabel: getSampleLabel(resource, items),
    breakdown: deriveBreakdown(resource, items),
    warning: deriveWarning(resource, items),
  };
}

async function readExternalDashboardStats(
  _options: ExternalStatsReadOptions = {}
): Promise<ExternalStatsSummary> {
  const totals: Record<ExternalStatsKey, number> = { ...EMPTY_TOTALS };
  const modules: ExternalStatsModuleSummary[] = [];
  const failedResources: string[] = [];

  try {
    getBackendApiBaseUrl();
  } catch {
    return {
      ...totals,
      totalPublicRecords: 0,
      modulesWithData: 0,
      modulesWithWarnings: 0,
      emptyModules: 0,
      failedResources: ["Konfigurasi API"],
      modules: [],
    };
  }

  const results = await Promise.allSettled(
    EXTERNAL_STATS_RESOURCES.map(async (resource) => {
      const snapshot = await fetchExternalCollectionSnapshot(resource);

      return createModuleSummary(
        resource,
        snapshot.totalRecords,
        snapshot.items
      );
    })
  );

  for (const [index, result] of results.entries()) {
    const resource = EXTERNAL_STATS_RESOURCES[index];

    if (result.status === "fulfilled") {
      totals[resource.key] = result.value.totalRecords;
      modules.push(result.value);
      continue;
    }

    failedResources.push(resource.label);
  }

  return {
    ...totals,
    totalPublicRecords: Object.values(totals).reduce((total, value) => total + value, 0),
    modulesWithData: modules.filter((module) => module.totalRecords > 0).length,
    modulesWithWarnings: modules.filter((module) => module.warning).length,
    emptyModules: modules.filter((module) => module.totalRecords === 0).length,
    failedResources,
    modules,
  };
}

const readExternalDashboardStatsFresh = createAdminReader(
  "admin-external-stats",
  readExternalDashboardStats,
  {
    revalidate: 60,
    tags: [ADMIN_STATE_TAGS.externalStats],
  }
);

export async function getExternalDashboardStats(
  options: ExternalStatsReadOptions = {}
): Promise<ExternalStatsSummary> {
  return readExternalDashboardStatsFresh(options);
}
