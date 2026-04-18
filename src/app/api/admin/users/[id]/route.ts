import { NextRequest, NextResponse } from "next/server";

import {
  authorizeAdminRequest,
  getRequestIpAddress,
} from "@/lib/admin/security";
import { ADMIN_CACHE_TAGS, revalidateAdminTags } from "@/lib/admin/cache";
import { createAuditEntry } from "@/lib/admin/service";
import {
  deleteUser,
  getUserDetail,
  updateUser,
} from "@/lib/admin/users";
import {
  createBackendErrorResponse,
  createJsonErrorResponse,
  createValidationErrorResponse,
  readJsonRequestBody,
} from "@/lib/server/http";
import {
  adminUserUpdateSchema,
  validateForm,
} from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await authorizeAdminRequest(request, { roles: ["admin"] });
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const user = await getUserDetail(
      id,
      auth.user.backendAccessToken,
      request.nextUrl.origin
    );

    return NextResponse.json({ data: user });
  } catch (error) {
    return createBackendErrorResponse(
      error,
      "Gagal mengambil detail pengguna backend."
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await authorizeAdminRequest(request, {
    requireCsrf: true,
    roles: ["admin"],
  });
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
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
      auth.user.backendAccessToken,
      request.nextUrl.origin
    );

    try {
      await createAuditEntry({
        action: "UPDATE",
        module: "users",
        details: `Memperbarui pengguna ${validatedData.email} pada Control Users.`,
        actor: auth.user,
        ipAddress: getRequestIpAddress(request),
      });
    } catch {
      // Update backend sudah berhasil. Gagal audit tidak perlu
      // mengubah respons sukses utama.
    }

    revalidateAdminTags([
      ADMIN_CACHE_TAGS.usersDirectory,
      ADMIN_CACHE_TAGS.dashboardOverview,
    ]);

    return NextResponse.json(result);
  } catch (error) {
    return createBackendErrorResponse(
      error,
      "Gagal memperbarui pengguna backend."
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authorizeAdminRequest(request, {
    requireCsrf: true,
    roles: ["admin"],
  });
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    await deleteUser(id, auth.user.backendAccessToken, request.nextUrl.origin);

    try {
      await createAuditEntry({
        action: "DELETE",
        module: "users",
        details: `Menghapus pengguna dengan id ${id} dari Control Users.`,
        actor: auth.user,
        ipAddress: getRequestIpAddress(request),
      });
    } catch {
      // Delete backend sudah berhasil. Audit hanyalah side effect.
    }

    revalidateAdminTags([
      ADMIN_CACHE_TAGS.usersDirectory,
      ADMIN_CACHE_TAGS.dashboardOverview,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return createBackendErrorResponse(
      error,
      "Gagal menghapus pengguna backend."
    );
  }
}
