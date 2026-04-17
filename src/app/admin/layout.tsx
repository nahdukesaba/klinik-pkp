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
        id: user.id,
        name: user.name,
        email: user.email,
        nip: user.nip,
        role: user.role,
      }}
    >
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
