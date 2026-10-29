import { redirect } from "next/navigation";

import { AdminAuthProvider, AdminShell } from "@/components/admin";
import { getSessionUserFromCookies } from "@/lib/admin/security";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUserFromCookies();

  if (!user) {
    redirect("/login");
  }

  return (
    <AdminAuthProvider
      user={{
        appUserId: user.appUserId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        nip: user.nip,
        role: user.role,
        status: user.status,
        loginSource: user.loginSource,
        accessTokenExpiresAt: user.accessTokenExpiresAt,
      }}
    >
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
