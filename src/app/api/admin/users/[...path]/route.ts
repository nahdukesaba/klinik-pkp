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

async function resolveAppUserId(context: RouteContext) {
  const { path } = await context.params;
  const [appUserId, ...extraSegments] = path;

  if (!appUserId || extraSegments.length > 0) {
    return null;
  }

  return appUserId;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const appUserId = await resolveAppUserId(context);
  if (!appUserId) {
    return createInvalidUserPathResponse();
  }

  return handleGetUser(request, appUserId);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const appUserId = await resolveAppUserId(context);
  if (!appUserId) {
    return createInvalidUserPathResponse();
  }

  return handleUpdateUser(request, appUserId);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const appUserId = await resolveAppUserId(context);
  if (!appUserId) {
    return createInvalidUserPathResponse();
  }

  return handleDeleteUser(request, appUserId);
}
