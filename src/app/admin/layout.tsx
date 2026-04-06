import { redirect } from "next/navigation";

import { AdminAuthProvider } from "@/components/admin/AdminAuthGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSessionUserFromCookies } from "@/lib/admin/security";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Klinik PKP",
  description:
    "Panel administrasi untuk mengelola konten dan data Klinik PKP - BP3KP Sumatera II.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUserFromCookies();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  return (
    <AdminAuthProvider user={user}>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
