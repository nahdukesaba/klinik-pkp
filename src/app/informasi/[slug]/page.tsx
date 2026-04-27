/**
 * Route: /informasi/[slug]
 *
 * Dynamic route untuk halaman-halaman informasi.
 * File ini bertugas sebagai registry routing + metadata.
 */

import { notFound, redirect } from "next/navigation";

import {
  AplikasiTerkaitPage,
  KanalPengaduanPage,
  RumahLayakHuniPage,
  TahapanPage,
} from "@/components/informasi/InformasiPages";
import PeraturanPage from "@/components/informasi/PeraturanPage";
import TentangPage from "@/components/informasi/TentangPage";
import { HUBUNGI_KAMI_HREF } from "@/lib/constants";

import type { Metadata } from "next";

const pageRegistry = {
  "rumah-layak-huni": {
    component: RumahLayakHuniPage,
    title: "Rumah Layak Huni",
    description:
      "Panduan indikator rumah layak huni untuk membantu masyarakat memahami standar hunian yang aman dan sehat.",
  },
  tahapan: {
    component: TahapanPage,
    title: "Tahapan",
    description:
      "Urutan tahapan pembangunan rumah agar proses perencanaan dan pelaksanaan lebih terstruktur.",
  },
  about: {
    component: TentangPage,
    title: "Tentang",
    description:
      "Profil BP3KP Sumatera II dan Klinik PKP beserta tugas, fungsi, wilayah kerja, dan layanan utamanya.",
  },
  "aplikasi-terkait": {
    component: AplikasiTerkaitPage,
    title: "Aplikasi Terkait",
    description:
      "Ringkasan aplikasi resmi yang paling sering dibutuhkan untuk pencarian rumah subsidi, pembiayaan, dan layanan perumahan.",
  },
  "kanal-pengaduan": {
    component: KanalPengaduanPage,
    title: "Kanal Pengaduan",
    description:
      "Daftar kanal pengaduan resmi yang dapat digunakan masyarakat sesuai jenis laporan dan kebutuhan tindak lanjut.",
  },
  peraturan: {
    component: PeraturanPage,
    title: "Peraturan",
    description:
      "Kumpulan peraturan dan kebijakan terkait perumahan, bangunan gedung, dan program BSPS.",
  },
} as const;

const legacyRedirects: Record<string, string> = {
  tentang: "/informasi/about",
  kontak: HUBUNGI_KAMI_HREF,
};

interface InformasiParams {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<InformasiParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (slug in legacyRedirects) {
    return {};
  }

  const pageEntry = pageRegistry[slug as keyof typeof pageRegistry];
  if (!pageEntry) {
    return {};
  }

  return {
    title: `${pageEntry.title} - Informasi Klinik PKP`,
    description: pageEntry.description,
  };
}

export default async function InformasiDynamicPage({
  params,
}: {
  params: Promise<InformasiParams>;
}) {
  const { slug } = await params;

  const legacyDestination = legacyRedirects[slug];
  if (legacyDestination) {
    redirect(legacyDestination);
  }

  const pageEntry = pageRegistry[slug as keyof typeof pageRegistry];
  if (!pageEntry) {
    notFound();
  }

  const PageComponent = pageEntry.component;

  return <PageComponent />;
}

export function generateStaticParams() {
  return Object.keys(pageRegistry).map((slug) => ({ slug }));
}
