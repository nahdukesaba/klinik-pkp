import { NextRequest } from "next/server";

import {
  type ExternalAdminResource,
  proxyExternalAdminResource,
  readExternalJsonBody,
  resolveExternalAdminResource,
} from "@/lib/admin/external-resource";
import {
  authorizeAdminRequest,
  getRequestIpAddress,
} from "@/lib/admin/security";
import { ADMIN_CACHE_TAGS, revalidateAdminTag } from "@/lib/admin/cache";
import { createAuditEntry } from "@/lib/admin/service";
import {
  createJsonErrorResponse,
  createJsonResponse,
} from "@/lib/server/http";

interface RouteContext {
  params: Promise<{ resource: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await authorizeAdminRequest(request, {
    requireCsrf: true,
    roles: ["admin"],
  });
  if (!auth.ok) {
    return auth.response;
  }

  const { resource } = await context.params;
  const config = resolveExternalAdminResource(resource);
  if (!config) {
    return createJsonErrorResponse("Resource admin tidak ditemukan.", 404);
  }

  const body =
    config.bodyMode === "form-data"
      ? request.body
      : await readExternalJsonBody(request);
  if (!body && config.bodyMode !== "form-data") {
    return createJsonErrorResponse("Payload permintaan tidak valid.", 400);
  }
  if (config.bodyMode === "form-data" && !body) {
    return createJsonErrorResponse("Payload upload tidak valid.", 400);
  }

  const result = await proxyExternalAdminResource({
    resource: resource as ExternalAdminResource,
    method: "POST",
    body,
    contentType:
      config.bodyMode === "form-data"
        ? request.headers.get("content-type") ?? undefined
        : undefined,
    accessToken: auth.user.backendAccessToken,
  });

  if (!result.ok) {
    return createJsonResponse(result.payload, result.status);
  }

  try {
    await createAuditEntry({
      action: "CREATE",
      module: resource,
      details: `Menambahkan data baru pada modul ${resource}.`,
      actor: auth.user,
      ipAddress: getRequestIpAddress(request),
    });
  } catch {
    // Operasi utama sudah sukses di backend. Audit tidak perlu
    // membatalkan respons berhasil.
  }

  revalidateAdminTag(ADMIN_CACHE_TAGS.externalStats);

  return createJsonResponse(result.payload, result.status);
}
