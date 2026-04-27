import HubungiKamiPage from "@/components/hubungi-kami/HubungiKamiPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hubungi Kami - Klinik PKP",
  description:
    "Kanal kontak resmi Klinik PKP untuk konsultasi, pertanyaan umum, dan tindak lanjut layanan.",
};

export default function Page() {
  return <HubungiKamiPage />;
}
