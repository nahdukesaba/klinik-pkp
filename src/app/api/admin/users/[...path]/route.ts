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

async function resolveUserId(context: RouteContext) {
  const { path } = await context.params;
  const [id, ...extraSegments] = path;

  if (!id || extraSegments.length > 0) {
    return null;
  }

  return id;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const id = await resolveUserId(context);
  if (!id) {
    return createInvalidUserPathResponse();
  }

  return handleGetUser(request, id);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const id = await resolveUserId(context);
  if (!id) {
    return createInvalidUserPathResponse();
  }

  return handleUpdateUser(request, id);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const id = await resolveUserId(context);
  if (!id) {
    return createInvalidUserPathResponse();
  }

  return handleDeleteUser(request, id);
}
