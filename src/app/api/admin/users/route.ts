import { NextRequest, NextResponse } from "next/server";

import {
  authorizeAdminRequest,
  getRequestIpAddress,
} from "@/lib/admin/security";
import { createAuditEntry } from "@/lib/admin/service";
import {
  createBackendErrorResponse,
  createJsonErrorResponse,
  createValidationErrorResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import {
  ADMIN_USERS_PAGE_LIMIT,
  createUser,
  listUsersPage,
} from "@/lib/admin/users";
import {
  adminUserCreateSchema,
  validateForm,
} from "@/lib/validations";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(parsed));
}

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { roles: ["admin"] });
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1);
    const limit = Math.min(
      ADMIN_USERS_PAGE_LIMIT,
      parsePositiveInt(request.nextUrl.searchParams.get("limit"), ADMIN_USERS_PAGE_LIMIT)
    );
    const users = await listUsersPage(
      auth.user.backendAccessToken,
      request.nextUrl.origin,
      { page, limit }
    );
    return NextResponse.json({
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

export async function POST(request: NextRequest) {
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
      auth.user.backendAccessToken,
      request.nextUrl.origin
    );

    try {
      await createAuditEntry({
        action: "CREATE",
        module: "users",
        details: `Menambahkan pengguna ${validatedData.email} ke Control Users.`,
        actor: auth.user,
        ipAddress: getRequestIpAddress(request),
      });
    } catch {
      // Perubahan utama sudah berhasil di backend. Audit tidak boleh
      // membatalkan respons sukses ke client.
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return createBackendErrorResponse(
      error,
      "Gagal membuat pengguna backend."
    );
  }
}
