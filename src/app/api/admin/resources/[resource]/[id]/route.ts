import { NextRequest } from "next/server";

import {
  handleExternalAdminResourceDetail,
  handleExternalAdminResourceMutation,
} from "@/lib/admin/route-handlers";

interface RouteContext {
  params: Promise<{ resource: string; id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { resource, id } = await context.params;
  return handleExternalAdminResourceDetail(request, resource, id);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { resource, id } = await context.params;
  return handleExternalAdminResourceMutation(request, {
    method: "PUT",
    action: "UPDATE",
    resource,
    id,
    details: ({ resource: module, id: resourceId }) =>
      `Memperbarui data ${module} dengan id ${resourceId}.`,
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { resource, id } = await context.params;
  return handleExternalAdminResourceMutation(request, {
    method: "PUT",
    action: "UPDATE",
    resource,
    id,
    details: ({ resource: module, id: resourceId }) =>
      `Memperbarui data ${module} dengan id ${resourceId}.`,
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { resource, id } = await context.params;
  return handleExternalAdminResourceMutation(request, {
    method: "DELETE",
    action: "DELETE",
    resource,
    id,
    details: ({ resource: module, id: resourceId }) =>
      `Menghapus data ${module} dengan id ${resourceId}.`,
  });
}
