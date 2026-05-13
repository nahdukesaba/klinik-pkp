/**
 * Route: /sosialisasi-klinik-pkp/berita/[id]
 *
 * Routing bertugas memvalidasi params lebih awal.
 * UI + data fetching tetap berada di komponen client.
 */

import { notFound } from "next/navigation";

import BeritaDetailPage from "@/components/berita/BeritaDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BeritaDetailRoute({ params }: PageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  return <BeritaDetailPage id={id} />;
}
