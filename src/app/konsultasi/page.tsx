import KonsultasiPage from "@/components/konsultasi/KonsultasiPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konsultasi - Klinik PKP",
  description:
    "Pilih alur konsultasi Klinik PKP untuk memulai konsultasi online atau melanjutkan ke kanal kontak yang sesuai.",
};

export default function Page() {
  return <KonsultasiPage />;
}
