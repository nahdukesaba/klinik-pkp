import { NextRequest } from "next/server";

import {
  createBackendErrorResponse,
  createJsonErrorResponse,
  createJsonResponse,
  createValidationErrorResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import {
  adminFaqMutationSchema,
  adminUserCreateSchema,
  adminUserUpdateSchema,
  validateForm,
} from "@/lib/validations";

import {
  ADMIN_STATE_TAGS,
  markAdminStateChanged,
  markAdminStatesChanged,
} from "./cache";
import {
  type ExternalAdminResource,
  proxyExternalAdminResource,
  readExternalAdminRequestBody,
  resolveExternalAdminResource,
} from "./external-resource";
import {
  type AdminSessionUser,
  authorizeAdminRequest,
  getRequestIpAddress,
} from "./security";
import { createAuditEntry, listAuditEntriesPage } from "./service";
import {
  ADMIN_USERS_PAGE_LIMIT,
  createUser,
  deleteUser,
  getUserDetail,
  listUsersPage,
  updateUser,
} from "./users";

type ExternalResourceMutationMethod = "POST" | "PUT" | "DELETE";
type ExternalResourceAuditAction = "CREATE" | "UPDATE" | "DELETE";
const textEncoder = new TextEncoder();
const MAX_ADMIN_RESOURCE_PAGE_LIMIT = 100;

interface ExternalResourceMutationOptions {
  method: ExternalResourceMutationMethod;
  action: ExternalResourceAuditAction;
  resource: string;
  id?: string;
  details: (params: { resource: string; id?: string }) => string;
}

function getByteLength(value: string) {
  return textEncoder.encode(value).length;
}

function getApproxFormDataPayloadBytes(formData: FormData) {
  let totalBytes = 0;

  for (const [, value] of formData.entries()) {
    totalBytes +=
      value instanceof File ? value.size : getByteLength(String(value));
  }

  return totalBytes;
}

function formatBytesToMb(bytes: number) {
  return Number((bytes / (1024 * 1024)).toFixed(2));
}

function buildUpstreamUploadTooLargeMessage(formData: FormData) {
  const approxPayloadMb = formatBytesToMb(getApproxFormDataPayloadBytes(formData));

  return `Upload melebihi batas server. Total file yang dikirim diperkirakan sekitar ${approxPayloadMb} MB. Kurangi ukuran atau jumlah file, lalu coba lagi.`;
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(parsed));
}

function sanitizeAdminResourceSearchParams(searchParams: URLSearchParams) {
  const sanitized = new URLSearchParams(searchParams);

  if (sanitized.has("page")) {
    sanitized.set("page", String(parsePositiveInt(sanitized.get("page"), 1)));
  }

  if (sanitized.has("limit")) {
    sanitized.set(
      "limit",
      String(
        Math.min(
          MAX_ADMIN_RESOURCE_PAGE_LIMIT,
          parsePositiveInt(sanitized.get("limit"), MAX_ADMIN_RESOURCE_PAGE_LIMIT)
        )
      )
    );
  }

  return sanitized;
}

function markUsersAdminStateChanged() {
  markAdminStatesChanged([
    ADMIN_STATE_TAGS.usersDirectory,
    ADMIN_STATE_TAGS.dashboardOverview,
  ]);
}

async function recordAudit(
  request: NextRequest,
  actor: AdminSessionUser,
  params: {
    action: "CREATE" | "UPDATE" | "DELETE";
    module: string;
    details: string;
  }
) {
  try {
    await createAuditEntry({
      action: params.action,
      module: params.module,
      details: params.details,
      actor,
      ipAddress: getRequestIpAddress(request),
    });
  } catch {
    // Aksi utama tidak boleh gagal hanya karena audit side effect.
  }
}

async function readExternalMutationBody(request: NextRequest, resource: string) {
  const config = resolveExternalAdminResource(resource);
  if (!config) {
    return {
      ok: false as const,
      response: createJsonErrorResponse("Resource admin tidak ditemukan.", 404),
    };
  }

  const body = await readExternalAdminRequestBody(request, config.bodyMode);
  if (!body && config.bodyMode !== "form-data") {
    return {
      ok: false as const,
      response: createJsonErrorResponse("Payload permintaan tidak valid.", 400),
    };
  }

  if (config.bodyMode === "form-data" && !body) {
    return {
      ok: false as const,
      response: createJsonErrorResponse("Payload upload tidak valid.", 400),
    };
  }

  if (resource === "faq" && !(body instanceof FormData)) {
    const validation = validateForm(adminFaqMutationSchema, body);
    if (!validation.success) {
      return {
        ok: false as const,
        response: createValidationErrorResponse(
          "Data FAQ tidak valid.",
          validation.errors
        ),
      };
    }

    return { ok: true as const, body: validation.data };
  }

  return { ok: true as const, body };
}

export async function handleExternalAdminResourceList(
  request: NextRequest,
  resource: string
) {
  const auth = await authorizeAdminRequest(request, { roles: ["admin"] });
  if (!auth.ok) {
    return auth.response;
  }

  if (!resolveExternalAdminResource(resource)) {
    return createJsonErrorResponse("Resource admin tidak ditemukan.", 404);
  }

  const result = await proxyExternalAdminResource({
    resource: resource as ExternalAdminResource,
    method: "GET",
    accessToken: auth.user.backendAccessToken,
    searchParams: sanitizeAdminResourceSearchParams(request.nextUrl.searchParams),
  });

  return createJsonResponse(result.payload, result.status);
}

export async function handleExternalAdminResourceDetail(
  request: NextRequest,
  resource: string,
  id: string
) {
  const auth = await authorizeAdminRequest(request, { roles: ["admin"] });
  if (!auth.ok) {
    return auth.response;
  }

  if (!resolveExternalAdminResource(resource)) {
    return createJsonErrorResponse(
      "Resource admin tidak ditemukan.",
      404,
      undefined,
      "RESOURCE_NOT_FOUND"
    );
  }

  const result = await proxyExternalAdminResource({
    resource: resource as ExternalAdminResource,
    method: "GET",
    id,
    accessToken: auth.user.backendAccessToken,
    searchParams: request.nextUrl.searchParams,
  });

  return createJsonResponse(result.payload, result.status);
}

export async function handleExternalAdminResourceMutation(
  request: NextRequest,
  options: ExternalResourceMutationOptions
) {
  const auth = await authorizeAdminRequest(request, {
    requireCsrf: true,
    roles: ["admin"],
  });
  if (!auth.ok) {
    return auth.response;
  }

  if (!resolveExternalAdminResource(options.resource)) {
    return createJsonErrorResponse("Resource admin tidak ditemukan.", 404);
  }

  const requiresBody = options.method !== "DELETE";
  const bodyResult = requiresBody
    ? await readExternalMutationBody(request, options.resource)
    : { ok: true as const, body: null };

  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.body;
  const result = await proxyExternalAdminResource({
    resource: options.resource as ExternalAdminResource,
    method: options.method,
    id: options.id,
    body,
    accessToken: auth.user.backendAccessToken,
  });

  if (!result.ok) {
    if (result.status === 413 && body instanceof FormData) {
      return createJsonErrorResponse(
        buildUpstreamUploadTooLargeMessage(body),
        413
      );
    }

    return createJsonResponse(result.payload, result.status);
  }

  await recordAudit(request, auth.user, {
    action: options.action,
    module: options.resource,
    details: options.details({ resource: options.resource, id: options.id }),
  });

  markAdminStateChanged(ADMIN_STATE_TAGS.externalStats);

  return createJsonResponse(result.payload, result.status);
}

export async function handleListUsers(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { roles: ["admin"] });
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1);
    const limit = Math.min(
      ADMIN_USERS_PAGE_LIMIT,
      parsePositiveInt(
        request.nextUrl.searchParams.get("limit"),
        ADMIN_USERS_PAGE_LIMIT
      )
    );
    const users = await listUsersPage(
      auth.user.backendAccessToken,
      { page, limit }
    );

    return createJsonResponse({
      data: users.items,
      meta: users.meta,
    });
  } catch (error) {
    return createBackendErrorResponse(
      error,
      "Gagal mengambil data pengguna backend."
    );
  }
}

export async function handleCreateUser(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, {
    requireCsrf: true,
    roles: ["admin"],
  });
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJsonRequestBody<Record<string, unknown>>(request);
  if (!body) {
    return createJsonErrorResponse("Payload pengguna tidak valid.", 400);
  }

  const validation = validateForm(adminUserCreateSchema, body);
  if (!validation.success) {
    return createValidationErrorResponse(
      "Data pengguna tidak valid.",
      validation.errors
    );
  }

  const validatedData = validation.data;
  if (!validatedData) {
    return createJsonErrorResponse("Data pengguna tidak valid.", 400);
  }

  try {
    const result = await createUser(
      validatedData,
      auth.user.backendAccessToken
    );

    await recordAudit(request, auth.user, {
      action: "CREATE",
      module: "users",
      details: `Menambahkan pengguna ${validatedData.email} ke Control Users.`,
    });

    markUsersAdminStateChanged();

    return createJsonResponse(result, 201);
  } catch (error) {
    return createBackendErrorResponse(
      error,
      "Gagal membuat pengguna backend."
    );
  }
}

export async function handleGetUser(request: NextRequest, id: string) {
  const auth = await authorizeAdminRequest(request, { roles: ["admin"] });
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const user = await getUserDetail(
      id,
      auth.user.backendAccessToken
    );

    return createJsonResponse({ data: user });
  } catch (error) {
    return createBackendErrorResponse(
      error,
      "Gagal mengambil detail pengguna backend."
    );
  }
}

export async function handleUpdateUser(request: NextRequest, id: string) {
  const auth = await authorizeAdminRequest(request, {
    requireCsrf: true,
    roles: ["admin"],
  });
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJsonRequestBody<Record<string, unknown>>(request);
  if (!body) {
    return createJsonErrorResponse("Payload pengguna tidak valid.", 400);
  }

  if (typeof body.password === "string" && body.password.trim() !== "") {
    return createJsonErrorResponse(
      "Password pengguna yang sudah ada tidak dapat diubah dari Control Users.",
      403
    );
  }

  const validation = validateForm(adminUserUpdateSchema, body);
  if (!validation.success) {
    return createValidationErrorResponse(
      "Data pengguna tidak valid.",
      validation.errors
    );
  }

  const validatedData = validation.data;
  if (!validatedData) {
    return createJsonErrorResponse("Data pengguna tidak valid.", 400);
  }

  try {
    const result = await updateUser(
      id,
      validatedData,
      auth.user.backendAccessToken
    );

    await recordAudit(request, auth.user, {
      action: "UPDATE",
      module: "users",
      details: `Memperbarui pengguna ${validatedData.email} pada Control Users.`,
    });

    markUsersAdminStateChanged();

    return createJsonResponse(result);
  } catch (error) {
    return createBackendErrorResponse(
      error,
      "Gagal memperbarui pengguna backend."
    );
  }
}

export async function handleDeleteUser(request: NextRequest, id: string) {
  const auth = await authorizeAdminRequest(request, {
    requireCsrf: true,
    roles: ["admin"],
  });
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await deleteUser(id, auth.user.backendAccessToken);

    await recordAudit(request, auth.user, {
      action: "DELETE",
      module: "users",
      details: `Menghapus pengguna dengan id ${id} dari Control Users.`,
    });

    markUsersAdminStateChanged();

    return createJsonResponse({ success: true });
  } catch (error) {
    return createBackendErrorResponse(
      error,
      "Gagal menghapus pengguna backend."
    );
  }
}

export function parseAdminListPagination(
  request: NextRequest,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
) {
  const maxLimit = defaults.maxLimit ?? MAX_ADMIN_RESOURCE_PAGE_LIMIT;
  const page = parsePositiveInt(
    request.nextUrl.searchParams.get("page"),
    defaults.page ?? 1
  );
  const limit = Math.min(
    maxLimit,
    parsePositiveInt(
      request.nextUrl.searchParams.get("limit"),
      defaults.limit ?? maxLimit
    )
  );

  return { page, limit };
}

export async function handleListAuditEntries(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { roles: ["admin"] });
  if (!auth.ok) {
    return auth.response;
  }

  const { page, limit } = parseAdminListPagination(request, {
    limit: 20,
    maxLimit: 100,
  });
  const audit = await listAuditEntriesPage(page, limit);

  return createJsonResponse({ data: audit.items, meta: audit.meta });
}
