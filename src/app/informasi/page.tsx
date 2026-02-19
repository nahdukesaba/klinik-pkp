/**
 * Route: /informasi
 * 
 * FILE INI HANYA UNTUK ROUTING!
 * Redirect ke halaman tentang sebagai default
 */

import { redirect } from "next/navigation";

export default function InformasiPage() {
  redirect("/informasi/tentang");
}
