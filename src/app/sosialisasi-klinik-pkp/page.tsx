/**
 * Route: /sosialisasi-klinik-pkp
 *
 * Shell halaman dirender lebih awal supaya pengguna tetap melihat UI
 * meski data publik dan komponen interaktif masih menyusul.
 */

import SosialisasiKlinikPage from "@/components/sosialisasi-pkp/SosialisasiKlinikPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sosialisasi Klinik PKP - Klinik PKP",
  description:
    "Informasi sosialisasi dan edukasi bidang perumahan dan kawasan permukiman, termasuk jadwal, peta lokasi, dan berita kegiatan.",
};

export default function Page() {
  return <SosialisasiKlinikPage />;
}
