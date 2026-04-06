import { redirect } from "next/navigation";

import LoginPage from "@/components/login/LoginPage";
import { getSessionUserFromCookies } from "@/lib/admin/security";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Masuk ke dashboard Klinik PKP untuk mengelola data perumahan dan kawasan permukiman.",
};

export default async function LoginRoute() {
  const user = await getSessionUserFromCookies();
  if (user) {
    redirect("/admin");
  }

  return <LoginPage />;
}
