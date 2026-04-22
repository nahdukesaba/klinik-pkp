/**
 * Route kompatibilitas untuk `/berita`.
 * URL kanonis berita berada di `/sosialisasi-klinik-pkp`.
 */

import { redirect } from "next/navigation";

export default function BeritaRedirectPage() {
  redirect("/sosialisasi-klinik-pkp");
}
