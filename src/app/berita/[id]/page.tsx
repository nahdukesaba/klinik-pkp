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

/** Route tujuan menggunakan ID numerik, jadi hanya angka yang valid. */
const VALID_ID_PATTERN = /^\d+$/;

export default async function BeritaDetailRedirectPage({ params }: PageProps) {
  const { id } = await params;

  // Tolak ID yang tidak numerik sebelum diteruskan ke route kanonis.
  if (!VALID_ID_PATTERN.test(id)) {
    notFound();
  }

  redirect(`/sosialisasi-klinik-pkp/berita/${id}`);
}
