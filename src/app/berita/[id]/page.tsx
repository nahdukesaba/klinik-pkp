/**
 * Route: /berita/[id]
 *
 * Redirect ke halaman sosialisasi detail.
 * Validasi format ID untuk mencegah path traversal.
 */

import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Hanya izinkan ID berupa alphanumeric dan dash */
const VALID_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export default async function BeritaDetailRedirectPage({ params }: PageProps) {
  const { id } = await params;

  // Validasi format ID untuk mencegah path traversal (e.g. ../../admin)
  if (!VALID_ID_PATTERN.test(id)) {
    notFound();
  }

  redirect(`/sosialisasi-klinik-pkp/berita/${id}`);
}
