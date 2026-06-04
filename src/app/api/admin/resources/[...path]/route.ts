import { NextRequest } from "next/server";

import {
  handleExternalAdminResourceDetail,
  handleExternalAdminResourceList,
  handleExternalAdminResourceMutation,
} from "@/lib/admin/route-handlers";
import {
  createJsonErrorResponse,
  createValidationErrorResponse,
} from "@/lib/server/http";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

interface AdminResourcePath {
  resource: string;
  id?: string;
}

function getDetailResourceId(request: NextRequest) {
  return request.nextUrl.searchParams.get("id") ?? undefined;
}

function createMissingResourceIdResponse() {
  return createValidationErrorResponse(
    "ID resource admin wajib diisi.",
    { id: ["ID resource wajib diisi untuk operasi detail."] }
  );
}

function createInvalidResourcePathResponse() {
  return createJsonErrorResponse(
    "Endpoint resource admin tidak valid.",
    404,
    undefined,
    "RESOURCE_NOT_FOUND"
  );
}

async function resolveResourcePath(context: RouteContext) {
  const { path } = await context.params;
  const [resource, id, ...extraSegments] = path;

  if (!resource || extraSegments.length > 0) {
    return null;
  }

  return { resource, id } satisfies AdminResourcePath;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const resolvedPath = await resolveResourcePath(context);
  if (!resolvedPath) {
    return createInvalidResourcePathResponse();
  }

  const id = resolvedPath.id ?? getDetailResourceId(request);
  if (id) {
    return handleExternalAdminResourceDetail(
      request,
      resolvedPath.resource,
      id
    );
  }

  return handleExternalAdminResourceList(request, resolvedPath.resource);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const resolvedPath = await resolveResourcePath(context);
  if (!resolvedPath || resolvedPath.id) {
    return createInvalidResourcePathResponse();
  }

  return handleExternalAdminResourceMutation(request, {
    method: "POST",
    action: "CREATE",
    resource: resolvedPath.resource,
    details: ({ resource: module }) =>
      `Menambahkan data baru pada modul ${module}.`,
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const resolvedPath = await resolveResourcePath(context);
  if (!resolvedPath) {
    return createInvalidResourcePathResponse();
  }

  const id = resolvedPath.id ?? getDetailResourceId(request);
  if (!id) {
    return createMissingResourceIdResponse();
  }

  return handleExternalAdminResourceMutation(request, {
    method: "PUT",
    action: "UPDATE",
    resource: resolvedPath.resource,
    id,
    details: ({ resource: module, id: resourceId }) =>
      `Memperbarui data ${module} dengan id ${resourceId}.`,
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const resolvedPath = await resolveResourcePath(context);
  if (!resolvedPath) {
    return createInvalidResourcePathResponse();
  }

  const id = resolvedPath.id ?? getDetailResourceId(request);
  if (!id) {
    return createMissingResourceIdResponse();
  }

  return handleExternalAdminResourceMutation(request, {
    method: "DELETE",
    action: "DELETE",
    resource: resolvedPath.resource,
    id,
    details: ({ resource: module, id: resourceId }) =>
      `Menghapus data ${module} dengan id ${resourceId}.`,
  });
}
