import { attachCsrfCookie, createCsrfToken } from "@/lib/admin/security";
import { createJsonResponse } from "@/lib/server/http";

export async function GET() {
  const token = createCsrfToken();
  const response = createJsonResponse({ csrfToken: token });

  return attachCsrfCookie(response, token);
}
