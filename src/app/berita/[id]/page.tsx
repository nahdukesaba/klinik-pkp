/**
 * Route: /berita/[id]
 *
 * Redirect ke halaman sosialisasi detail.
 * Validasi format ID untuk mencegah path traversal.
 */

import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

/** Hanya izinkan ID berupa alphanumeric dan dash */
const VALID_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export default function BeritaDetailRedirectPage({ params }: PageProps) {
  // Validasi format ID untuk mencegah path traversal (e.g. ../../admin)
  if (!VALID_ID_PATTERN.test(params.id)) {
    notFound();
  }

  redirect(`/sosialisasi-klinik-pkp/berita/${params.id}`);
}
