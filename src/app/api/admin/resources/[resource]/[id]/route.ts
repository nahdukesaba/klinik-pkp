import { NextRequest } from "next/server";

import {
  type ExternalAdminResource,
  proxyExternalAdminResource,
  readExternalResourceBody,
  resolveExternalAdminResource,
} from "@/lib/admin/external-resource";
import {
  authorizeAdminRequest,
  getRequestIpAddress,
} from "@/lib/admin/security";
import { createAuditEntry } from "@/lib/admin/service";
import {
  createJsonErrorResponse,
  createJsonResponse,
} from "@/lib/server/http";

interface RouteContext {
  params: Promise<{ resource: string; id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await authorizeAdminRequest(request, {
    requireCsrf: true,
    roles: ["admin"],
  });
  if (!auth.ok) {
    return auth.response;
  }

  const { resource, id } = await context.params;
  const config = resolveExternalAdminResource(resource);
  if (!config) {
    return createJsonErrorResponse("Resource admin tidak ditemukan.", 404);
  }

  const body = await readExternalResourceBody(request, config.bodyMode);
  if (!body) {
    return createJsonErrorResponse("Payload permintaan tidak valid.", 400);
  }

  const result = await proxyExternalAdminResource({
    resource: resource as ExternalAdminResource,
    method: "PUT",
    id,
    body,
    accessToken: auth.user.backendAccessToken,
    origin: request.nextUrl.origin,
  });

  if (!result.ok) {
    return createJsonResponse(result.payload, result.status);
  }

  try {
    await createAuditEntry({
      action: "UPDATE",
      module: resource,
      details: `Memperbarui data ${resource} dengan id ${id}.`,
      actor: auth.user,
      ipAddress: getRequestIpAddress(request),
    });
  } catch {
    // Audit tidak boleh membatalkan update yang sudah sukses.
  }

  return createJsonResponse(result.payload, result.status);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authorizeAdminRequest(request, {
    requireCsrf: true,
    roles: ["admin"],
  });
  if (!auth.ok) {
    return auth.response;
  }

  const { resource, id } = await context.params;
  const config = resolveExternalAdminResource(resource);
  if (!config) {
    return createJsonErrorResponse("Resource admin tidak ditemukan.", 404);
  }

  const result = await proxyExternalAdminResource({
    resource: resource as ExternalAdminResource,
    method: "DELETE",
    id,
    accessToken: auth.user.backendAccessToken,
    origin: request.nextUrl.origin,
  });

  if (!result.ok) {
    return createJsonResponse(result.payload, result.status);
  }

  try {
    await createAuditEntry({
      action: "DELETE",
      module: resource,
      details: `Menghapus data ${resource} dengan id ${id}.`,
      actor: auth.user,
      ipAddress: getRequestIpAddress(request),
    });
  } catch {
    // Hapus utama sudah berhasil. Audit dibiarkan non-blocking.
  }

  return createJsonResponse(result.payload, result.status);
}
