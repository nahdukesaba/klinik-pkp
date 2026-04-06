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

  const body = await readExternalResourceBody(request, config.bodyMode);
  if (!body) {
    return createJsonErrorResponse("Payload permintaan tidak valid.", 400);
  }

  const result = await proxyExternalAdminResource({
    resource: resource as ExternalAdminResource,
    method: "POST",
    body,
    accessToken: auth.user.backendAccessToken,
    origin: request.nextUrl.origin,
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

  return createJsonResponse(result.payload, result.status);
}
