"use client";

import { adminFetch } from "@/lib/admin-client";
import {
  buildApiEndpoint,
  extractApiCollectionItems,
  extractApiPaginationMeta,
  type ApiPaginatedResult,
  type ApiQueryParams,
  type ApiResponse,
} from "@/lib/api-client";

export const ADMIN_RESOURCE_NAMES = {
  faq: "faq",
  bsps: "bsps",
  kumuh: "kumuh",
  rusun: "rusun",
  bankDesain: "bank-desain",
  sosialisasi: "sosialisasi",
} as const;

export type AdminResourceName =
  (typeof ADMIN_RESOURCE_NAMES)[keyof typeof ADMIN_RESOURCE_NAMES];

const ADMIN_RESOURCE_ENDPOINTS: Record<AdminResourceName, string> = {
  faq: "/api/admin/resources/faq",
  bsps: "/api/admin/resources/bsps",
  kumuh: "/api/admin/resources/kumuh",
  rusun: "/api/admin/resources/rusun",
  "bank-desain": "/api/admin/resources/bank-desain",
  sosialisasi: "/api/admin/resources/sosialisasi",
};

function getAdminResourceEndpoint(resource: AdminResourceName, id?: string | number) {
  const baseEndpoint = ADMIN_RESOURCE_ENDPOINTS[resource];
  return id == null ? baseEndpoint : `${baseEndpoint}/${encodeURIComponent(String(id))}`;
}

function getPositiveNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.trunc(parsed);
    }
  }

  return undefined;
}

function normalizeAdminPageMeta(
  response: ApiResponse<unknown>,
  query: ApiQueryParams | undefined,
  itemCount: number
) {
  const meta = {
    ...extractApiPaginationMeta(response.data),
    ...extractApiPaginationMeta(response.meta),
  };
  const requestedPage = getPositiveNumber(query?.page);
  const requestedLimit = getPositiveNumber(query?.limit);
  const page = requestedPage ?? meta.page ?? 1;
  const limit = requestedLimit ?? meta.limit ?? Math.max(itemCount, 1);
  const totalRecords = Math.max(meta.totalRecords ?? itemCount, itemCount);
  const totalPages = Math.max(
    1,
    meta.totalPages ?? Math.ceil(totalRecords / limit)
  );

  return {
    totalRecords,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function fetchAdminResourcePage<TApi, TOutput = TApi>(
  resource: AdminResourceName,
  options: {
    query?: ApiQueryParams;
    transform?: (item: TApi) => TOutput;
    errorMessage?: string;
    requestOptions?: Pick<RequestInit, "signal">;
  } = {}
): Promise<ApiPaginatedResult<TOutput>> {
  const response = await adminFetch<ApiResponse<unknown>>(
    buildApiEndpoint(getAdminResourceEndpoint(resource), options.query),
    options.requestOptions
  );

  if (!response.success) {
    throw new Error(
      typeof response.error === "string"
        ? response.error
        : response.error?.message ??
            response.message ??
            options.errorMessage ??
            "Gagal mengambil data admin."
    );
  }

  const items = extractApiCollectionItems<TApi>(response.data);

  if (!items) {
    throw new Error(options.errorMessage ?? "Format data admin tidak valid.");
  }

  const pageItems = options.transform
    ? items.map(options.transform)
    : (items as unknown as TOutput[]);

  return {
    items: pageItems,
    meta: normalizeAdminPageMeta(response, options.query, pageItems.length),
  };
}

export async function fetchAdminResourceDetail<TApi, TOutput = TApi>(
  resource: AdminResourceName,
  id: string | number,
  options: {
    transform?: (item: TApi) => TOutput;
    errorMessage?: string;
    requestOptions?: Pick<RequestInit, "signal">;
  } = {}
): Promise<TOutput> {
  const response = await adminFetch<ApiResponse<unknown>>(
    getAdminResourceEndpoint(resource, id),
    options.requestOptions
  );

  if (!response.success) {
    throw new Error(
      typeof response.error === "string"
        ? response.error
        : response.error?.message ??
            response.message ??
            options.errorMessage ??
            "Gagal mengambil detail data admin."
    );
  }

  const item = response.data as TApi;
  return options.transform ? options.transform(item) : (item as unknown as TOutput);
}

function buildAdminMutationRequest(payload: unknown | FormData, method: "POST" | "PUT") {
  const request: RequestInit = {
    method,
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  };

  if (!(payload instanceof FormData)) {
    request.headers = { "Content-Type": "application/json" };
  }

  return request;
}

export async function createAdminResource(
  resource: AdminResourceName,
  payload: unknown | FormData
) {
  return adminFetch(getAdminResourceEndpoint(resource), buildAdminMutationRequest(payload, "POST"));
}

export async function updateAdminResource(
  resource: AdminResourceName,
  id: string | number,
  payload: unknown | FormData
) {
  return adminFetch(
    getAdminResourceEndpoint(resource, id),
    buildAdminMutationRequest(payload, "PUT")
  );
}

export async function deleteAdminResource(
  resource: AdminResourceName,
  id: string | number
) {
  return adminFetch(getAdminResourceEndpoint(resource, id), {
    method: "DELETE",
  });
}
