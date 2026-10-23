import { NextRequest } from "next/server";

import {
  handleDeleteUser,
  handleGetUser,
  handleUpdateUser,
} from "@/lib/admin/route-handlers";
import { createJsonErrorResponse } from "@/lib/server/http";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

function createInvalidUserPathResponse() {
  return createJsonErrorResponse(
    "Endpoint pengguna admin tidak valid.",
    404,
    undefined,
    "USER_ENDPOINT_NOT_FOUND"
  );
}

async function resolveLegacyLocalUserId(context: RouteContext) {
  const { path } = await context.params;
  const [legacyLocalUserId, ...extraSegments] = path;

  if (!legacyLocalUserId || extraSegments.length > 0) {
    return null;
  }

  return legacyLocalUserId;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const legacyLocalUserId = await resolveLegacyLocalUserId(context);
  if (!legacyLocalUserId) {
    return createInvalidUserPathResponse();
  }

  return handleGetUser(request, legacyLocalUserId);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const legacyLocalUserId = await resolveLegacyLocalUserId(context);
  if (!legacyLocalUserId) {
    return createInvalidUserPathResponse();
  }

  return handleUpdateUser(request, legacyLocalUserId);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const legacyLocalUserId = await resolveLegacyLocalUserId(context);
  if (!legacyLocalUserId) {
    return createInvalidUserPathResponse();
  }

  return handleDeleteUser(request, legacyLocalUserId);
}
