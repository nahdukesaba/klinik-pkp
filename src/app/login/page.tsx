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

export default async function LoginRoute() {
  const user = await getAuthenticatedSessionUserFromCookies();
  if (user) {
    redirect(resolveAuthenticatedLandingPath(user.role));
  }

  return <LoginPage />;
}
