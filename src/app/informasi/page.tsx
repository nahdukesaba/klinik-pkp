/**
 * Route: /informasi
 *
 * FILE INI HANYA UNTUK ROUTING!
 * Redirect ke halaman informasi utama sebagai default.
 */

import { redirect } from "next/navigation";

import { INFORMASI_DEFAULT_HREF } from "@/lib/constants";

export default function InformasiPage() {
  redirect(INFORMASI_DEFAULT_HREF);
}
