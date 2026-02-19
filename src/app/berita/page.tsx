/**
 * Route: /berita
 *
 * Redirect ke halaman sosialisasi.
 */

import { redirect } from "next/navigation";

export default function BeritaRedirectPage() {
  redirect("/sosialisasi-klinik-pkp");
}