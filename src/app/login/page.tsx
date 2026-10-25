import { redirect } from "next/navigation";

import LoginPage from "@/components/login/LoginPage";
import { resolveAuthenticatedLandingPath } from "@/lib/auth/browser-sso-contract";
import { getAuthenticatedSessionUserFromCookies } from "@/lib/server/auth-session";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Masuk ke dashboard Klinik PKP untuk mengelola data perumahan dan kawasan permukiman.",
};

export default async function LoginRoute({
  searchParams,
}: {
  searchParams?: Promise<{ cancel_return?: string; return_to?: string }>;
}) {
  const user = await getAuthenticatedSessionUserFromCookies();
  if (user) {
    const params = searchParams ? await searchParams : {};
    const cancelReturn = params?.cancel_return || params?.return_to;
    if (
      cancelReturn &&
      cancelReturn.startsWith("/") &&
      !cancelReturn.startsWith("//") &&
      !cancelReturn.startsWith("/\\") &&
      !cancelReturn.includes("\\") &&
      !cancelReturn.includes("#")
    ) {
      redirect(cancelReturn);
    }
    redirect(resolveAuthenticatedLandingPath(user.role));
  }

  return <LoginPage />;
}
