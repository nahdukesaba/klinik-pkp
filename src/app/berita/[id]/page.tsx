/**
 * Route kompatibilitas untuk `/berita/[id]`.
 * URL kanonis detail berita berada di `/sosialisasi-klinik-pkp/berita/[id]`.
 */

import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const VALID_ID_PATTERN = /^\d+$/;

export default async function BeritaDetailRedirectPage({ params }: PageProps) {
  const { id } = await params;

  if (!VALID_ID_PATTERN.test(id)) {
    notFound();
  }

  redirect(`/sosialisasi-klinik-pkp/berita/${id}`);
}
