import { NextRequest } from "next/server";

import { handleCreateUser, handleListUsers } from "@/lib/admin/route-handlers";

export async function GET(request: NextRequest) {
  return handleListUsers(request);
}

export async function POST(request: NextRequest) {
  return handleCreateUser(request);
}
