import { NextRequest } from "next/server";

import { handleExternalAdminResourceMutation } from "@/lib/admin/route-handlers";

interface RouteContext {
  params: Promise<{ resource: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { resource } = await context.params;
  return handleExternalAdminResourceMutation(request, {
    method: "POST",
    action: "CREATE",
    resource,
    details: ({ resource: module }) =>
      `Menambahkan data baru pada modul ${module}.`,
  });
}
