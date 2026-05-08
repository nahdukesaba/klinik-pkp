import {
  ApiError,
  buildApiEndpoint,
  extractApiCollectionItems,
  extractApiPaginationMeta,
  fetchApiList,
  type ApiResponse,
} from "@/lib/api-client";

type FaqActiveValue = boolean | number | string | null | undefined;

export interface FaqApiItem {
  id: string | number;
  question: string;
  answer: string;
  is_active?: FaqActiveValue;
  isActive?: FaqActiveValue;
  active?: FaqActiveValue;
  status?: FaqActiveValue;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqListParams {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
  includeInactive?: boolean;
}

interface FaqFetchOptions {
  suppressErrorLog?: boolean;
}

const ACTIVE_STATUS_VALUES = new Set([
  "1",
  "true",
  "active",
  "aktif",
  "published",
  "publish",
  "enabled",
  "yes",
]);

const INACTIVE_STATUS_VALUES = new Set([
  "0",
  "false",
  "inactive",
  "nonaktif",
  "non-aktif",
  "draft",
  "archived",
  "disabled",
  "no",
]);

function parseActiveValue(value: FaqActiveValue) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (ACTIVE_STATUS_VALUES.has(normalized)) {
      return true;
    }

    if (INACTIVE_STATUS_VALUES.has(normalized)) {
      return false;
    }
  }

  return null;
}

function resolveFaqIsActive(item: FaqApiItem) {
  if (item.deleted_at) {
    return false;
  }

  const candidates = [
    item.is_active,
    item.isActive,
    item.active,
    item.status,
  ];

  for (const candidate of candidates) {
    const parsed = parseActiveValue(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  return true;
}

function transformFaqItem(item: FaqApiItem): FaqItem {
  return {
    id:
      typeof item.id === "number"
        ? item.id
        : Number.parseInt(String(item.id), 10) || 0,
    question: item.question ?? "",
    answer: item.answer ?? "",
    isActive: resolveFaqIsActive(item),
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? "",
  };
}

function filterActiveFaqs(faqs: FaqItem[]) {
  return faqs.filter((item) => item.isActive);
}

function buildFaqQuery(params: FaqListParams) {
  return {
    page: params.page,
    limit: params.perPage,
    search: params.search,
    is_active: params.isActive,
    include_inactive: params.includeInactive,
  };
}

function normalizeFaqListResponse(data: ApiResponse<unknown>, errorMessage: string) {
  if (!data.success) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : data.error?.message ?? data.message ?? errorMessage
    );
  }

  const items = extractApiCollectionItems<FaqApiItem>(data.data);
  if (!items) {
    throw new Error(errorMessage);
  }

  return {
    items,
    meta: {
      ...extractApiPaginationMeta(data.data),
      ...extractApiPaginationMeta(data.meta),
    },
  };
}

async function fetchAllAdminFaqListPages(
  params: FaqListParams,
  errorMessage: string
) {
  const firstPage = await fetchAdminFaqListPage(
    {
      ...params,
      page: params.page ?? 1,
      perPage: params.perPage ?? 50,
    },
    errorMessage
  );

  const items = [...firstPage.items];
  const pageLimit = firstPage.meta.limit ?? params.perPage ?? 50;
  const totalRecords = firstPage.meta.totalRecords ?? items.length;
  const totalPages =
    firstPage.meta.totalPages ?? Math.ceil(totalRecords / pageLimit);

  if (params.page == null && items.length < totalRecords) {
    for (let page = 2; page <= totalPages; page += 1) {
      const nextPage = await fetchAdminFaqListPage(
        {
          ...params,
          page,
          perPage: pageLimit,
        },
        errorMessage
      );

      items.push(...nextPage.items);
    }
  }

  return items;
}

function mergeFaqApiItems(items: FaqApiItem[]) {
  const itemsById = new Map<string, FaqApiItem>();

  for (const item of items) {
    itemsById.set(String(item.id), item);
  }

  return [...itemsById.values()];
}

async function fetchAdminFaqListPage(
  params: FaqListParams,
  errorMessage: string
) {
  const response = await fetch(
    buildApiEndpoint("/api/admin/resources/faq", buildFaqQuery(params)),
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    }
  );

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  const payload = await response.json();
  return normalizeFaqListResponse(payload, errorMessage);
}

export async function fetchFaqList(
  params: FaqListParams = {},
  options: FaqFetchOptions = {}
): Promise<FaqItem[]> {
  return fetchApiList<FaqApiItem, FaqItem>("/faqs", {
    query: buildFaqQuery(params),
    transform: transformFaqItem,
    errorMessage: "Gagal mengambil data FAQ dari server",
    collectAllPages: params.page == null && params.perPage == null,
    requestOptions: {
      cache: "no-store",
      ...(options.suppressErrorLog ? { suppressErrorLog: true } : {}),
    },
  });
}

export async function fetchPublicFaqList(
  params: Pick<FaqListParams, "search"> = {}
) {
  try {
    const faqs = await fetchFaqList(
      { ...params, isActive: true },
      { suppressErrorLog: true }
    );
    return filterActiveFaqs(faqs);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      return [];
    }

    throw error;
  }
}

export async function fetchAdminFaqList(
  params: FaqListParams = {}
): Promise<FaqItem[]> {
  const errorMessage = "Gagal mengambil data FAQ admin dari server";
  const primaryItems = await fetchAllAdminFaqListPages(
    {
      ...params,
      perPage: params.perPage ?? 50,
      includeInactive: params.includeInactive ?? true,
    },
    errorMessage
  );

  let items = primaryItems;

  if (params.includeInactive !== false && params.isActive == null) {
    try {
      const inactiveItems = await fetchAllAdminFaqListPages(
        {
          ...params,
          isActive: false,
          includeInactive: true,
          perPage: params.perPage ?? 50,
        },
        errorMessage
      );

      items = mergeFaqApiItems([...items, ...inactiveItems]);
    } catch {
      items = primaryItems;
    }
  }

  return items.map(transformFaqItem);
}
