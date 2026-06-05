import KonsultasiPage from "@/components/konsultasi/KonsultasiPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konsultasi - Klinik PKP",
  description:
    "Pilih alur konsultasi Klinik PKP untuk memulai Konsultasi Online atau melanjutkan ke kanal Kontak yang sesuai.",
};

export default function Page() {
  return <KonsultasiPage />;
}
