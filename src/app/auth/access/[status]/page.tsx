import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthPageShell } from "@/components/login/AuthPageShell";
import { Button } from "@/components/ui/button";

const ACCESS_MESSAGES = {
  pending: {
    title: "Akses sedang menunggu persetujuan",
    description:
      "Akun Anda sudah terdaftar, tetapi akses ke Klinik PKP masih menunggu persetujuan admin.",
  },
  rejected: {
    title: "Akses ditolak",
    description: "Akses akun Anda ke Klinik PKP ditolak.",
  },
  disabled: {
    title: "Akses dinonaktifkan",
    description: "Akses akun Anda ke Klinik PKP dinonaktifkan.",
  },
} as const;

export default async function KlinikAccessStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const message = ACCESS_MESSAGES[status as keyof typeof ACCESS_MESSAGES];
  if (!message) {
    notFound();
  }

  return (
    <AuthPageShell
      backHref="/login"
      backLabel="Kembali ke Login"
      title={message.title}
      subtitle={message.description}
    >
      <Button asChild variant="outline" className="w-full">
        <Link href="/login">Kembali ke login</Link>
      </Button>
    </AuthPageShell>
  );
}
