import { NextRequest } from "next/server";

import {
  handleDeleteUser,
  handleGetUser,
  handleUpdateUser,
} from "@/lib/admin/route-handlers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return handleGetUser(request, id);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return handleUpdateUser(request, id);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return handleDeleteUser(request, id);
}
