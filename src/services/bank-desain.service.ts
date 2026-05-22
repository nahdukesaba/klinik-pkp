/** Service API untuk data Bank Desain. Transform snake_case → camelCase. */

import {
  fetchApiList,
  fetchApiListWithMeta,
  type ApiRequestOptions,
  type ApiPaginatedResult,
} from "@/lib/api-client";
import {
  buildImageUrl,
  clampApiPageLimit,
  PUBLIC_LIST_FETCH_LIMIT,
} from "@/lib/constants";
import type {
  ApiListQueryControls,
  BankDesainFilterParams,
} from "@/types/api";

// --- Tipe API ---

/** Struktur data bank desain dari API (snake_case) */
export interface BankDesainApiItem {
  id: string;
  name: string;
  type: string;
  bedroom_count: number;
  bathroom_count: number;
  total_area: number;
  has_garage: boolean;
  image_urls: string[] | null;
  file_urls: string[] | null;
}

// --- Tipe Frontend ---

/** Data bank desain untuk UI (camelCase) */
export interface BankDesainData {
  id: string;
  /** Kode desain (dari ID API) */
  code: string;
  title: string;
  /** Tipe rumah untuk filter: "T36" */
  type: string;
  /** Filter teras/garasi: "dengan-teras" | "tanpa-teras" */
  terasFeature: string;
  /** URL thumbnail (gambar pertama) */
  thumbnail: string;
  bedrooms: number;
  bathrooms: number;
  /** Luas bangunan dalam m² */
  area: number;
  /** Gambar-gambar untuk preview */
  previewImages: string[];
  /** URL file RAB/PDF pertama */
  rabPdfUrl: string;
  /** URL file desain untuk diunduh */
  designFileUrl?: string;
  /** Deskripsi singkat desain */
  description?: string;
}

/** Kategori filter individual */
export interface FilterCategory {
  id: string;
  label: string;
}

/** Semua kategori filter untuk UI */
export interface FilterCategories {
  type: FilterCategory[];
  bedroom: FilterCategory[];
  teras: FilterCategory[];
}

export interface BankDesainListParams
  extends ApiListQueryControls,
    Omit<BankDesainFilterParams, "hasGarage"> {
  hasGarage?: BankDesainFilterParams["hasGarage"] | "true" | "false";
  collectAllPages?: boolean;
}

// --- Mapping tipe ---

const BANK_DESAIN_FALLBACK_IMAGE = "/service-bank-desain.jpg";
const BANK_DESAIN_API_TYPE = "Tipe 36";
const BANK_DESAIN_FRONTEND_TYPE = "T36";

const TYPE_MAP: Record<string, string> = {
  [BANK_DESAIN_API_TYPE]: BANK_DESAIN_FRONTEND_TYPE,
};

/** Label tipe untuk tampilan filter */
const TYPE_LABELS: Record<string, string> = {
  [BANK_DESAIN_FRONTEND_TYPE]: "Tipe 36 (36 m²)",
};

function normalizeBankDesainTypeParam(type?: string) {
  if (!type || type === "all") {
    return undefined;
  }

  return type === BANK_DESAIN_FRONTEND_TYPE ? BANK_DESAIN_API_TYPE : type;
}

function normalizeBooleanFilterParam(value: BankDesainListParams["hasGarage"]) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function buildBankDesainAssetUrl(path: string) {
  const cleanPath = path.trim();
  if (!cleanPath) {
    return "";
  }

  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("/api/ext/")
  ) {
    return cleanPath;
  }

  if (cleanPath.startsWith("/api/v1/")) {
    return cleanPath.replace("/api/v1/", "/api/ext/");
  }

  if (cleanPath.startsWith("api/v1/")) {
    return `/${cleanPath}`.replace("/api/v1/", "/api/ext/");
  }

  return buildImageUrl(cleanPath);
}

// --- Transformasi ---

/** Transform data API → format frontend */
export function transformBankDesainItem(item: BankDesainApiItem): BankDesainData {
  const imageUrls =
    item.image_urls?.map(buildBankDesainAssetUrl).filter(Boolean) ?? [];
  const fileUrls =
    item.file_urls?.map(buildBankDesainAssetUrl).filter(Boolean) ?? [];

  return {
    id: item.id,
    code: item.id.padStart(3, "0"),
    title: item.name,
    type: TYPE_MAP[item.type] ?? item.type,
    terasFeature: item.has_garage ? "dengan-teras" : "tanpa-teras",
    thumbnail: imageUrls[0] ?? BANK_DESAIN_FALLBACK_IMAGE,
    bedrooms: item.bedroom_count,
    bathrooms: item.bathroom_count,
    area: item.total_area,
    previewImages: imageUrls,
    rabPdfUrl: fileUrls[0] ?? "",
    designFileUrl: fileUrls[0],
    description: "",
  };
}

/** Bangun kategori filter dinamis dari data yang tersedia */
export function deriveFilterCategories(items: BankDesainData[]): FilterCategories {
  // Kumpulkan tipe unik
  const uniqueTypes = [...new Set(items.map((d) => d.type))].sort();
  const typeCategories: FilterCategory[] = [
    { id: "all", label: "Semua Tipe" },
    ...uniqueTypes.map((t) => ({
      id: t,
      label: TYPE_LABELS[t] ?? t,
    })),
  ];

  // Kumpulkan jumlah kamar unik
  const uniqueBedrooms = [...new Set(items.map((d) => d.bedrooms))].sort((a, b) => a - b);
  const bedroomCategories: FilterCategory[] = [
    { id: "all", label: "Semua Kamar" },
    ...uniqueBedrooms.map((b) => ({
      id: b.toString(),
      label: `${b} Kamar Tidur`,
    })),
  ];

  // Kategori teras (selalu sama)
  const terasCategories: FilterCategory[] = [
    { id: "all", label: "Semua" },
    { id: "dengan-teras", label: "Dengan Teras" },
    { id: "tanpa-teras", label: "Tanpa Teras" },
  ];

  return {
    type: typeCategories,
    bedroom: bedroomCategories,
    teras: terasCategories,
  };
}

// --- API ---

/** GET /api/ext/bank-desain — ambil semua data bank desain */
export async function fetchBankDesainList(
  params: BankDesainListParams = {}
): Promise<BankDesainData[]> {
  const items = await fetchApiList<BankDesainApiItem, BankDesainData>(
    "/bank-desain",
    {
      query: {
        type: normalizeBankDesainTypeParam(params.type),
        page: params.page,
        limit: clampApiPageLimit(params.perPage, PUBLIC_LIST_FETCH_LIMIT),
        name: params.name ?? params.keyword,
        bedroom_count: params.bedroomCount,
        bathroom_count: params.bathroomCount,
        has_garage: normalizeBooleanFilterParam(params.hasGarage),
        all: params.collectAllPages ?? true,
      },
      transform: transformBankDesainItem,
      errorMessage: "Gagal mengambil data bank desain dari server",
      collectAllPages: false,
      backendPageLimit: PUBLIC_LIST_FETCH_LIMIT,
      allowPartialResults: true,
    }
  );

  return items;
}

export async function fetchBankDesainPage(
  params: BankDesainListParams = {},
  requestOptions?: ApiRequestOptions
): Promise<ApiPaginatedResult<BankDesainData>> {
  const result = await fetchApiListWithMeta<BankDesainApiItem, BankDesainData>(
    "/bank-desain",
    {
      query: {
        type: normalizeBankDesainTypeParam(params.type),
        page: params.page,
        limit: clampApiPageLimit(params.perPage, PUBLIC_LIST_FETCH_LIMIT),
        name: params.name ?? params.keyword,
        bedroom_count: params.bedroomCount,
        bathroom_count: params.bathroomCount,
        has_garage: normalizeBooleanFilterParam(params.hasGarage),
      },
      transform: transformBankDesainItem,
      errorMessage: "Gagal mengambil data bank desain dari server",
      requestOptions,
      backendPageLimit: PUBLIC_LIST_FETCH_LIMIT,
      allowPartialResults: true,
    }
  );

  return result;
}
