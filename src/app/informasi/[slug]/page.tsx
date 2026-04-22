/**
 * Route: /informasi/[slug]
 *
 * Dynamic route untuk halaman-halaman informasi.
 * File ini hanya untuk routing.
 */

import { notFound } from "next/navigation";

import FaqPage from "@/components/informasi/FaqPage";
import KontakPage from "@/components/informasi/KontakPage";
import PeraturanPage from "@/components/informasi/PeraturanPage";
import RumahLayakHuniPage from "@/components/informasi/RumahLayakHuniPage";
import TahapanPage from "@/components/informasi/TahapanPage";
import TentangPage from "@/components/informasi/TentangPage";

const pageComponents = {
  faq: FaqPage,
  kontak: KontakPage,
  peraturan: PeraturanPage,
  "rumah-layak-huni": RumahLayakHuniPage,
  tahapan: TahapanPage,
  tentang: TentangPage,
} as const;

interface InformasiParams {
  slug: string;
}

export default async function InformasiDynamicPage({
  params,
}: {
  params: Promise<InformasiParams>;
}) {
  const { slug } = await params;
  const PageComponent = pageComponents[slug as keyof typeof pageComponents];

  if (!PageComponent) {
    notFound();
  }

  return <PageComponent />;
}

export function generateStaticParams() {
  return Object.keys(pageComponents).map((slug) => ({ slug }));
}
