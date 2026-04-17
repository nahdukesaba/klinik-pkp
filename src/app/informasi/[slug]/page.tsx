/**
 * Route: /informasi/[slug]
 * 
 * Dynamic route untuk halaman-halaman informasi.
 * FILE INI HANYA UNTUK ROUTING!
 * Komponen UI ada di: @/components/informasi/
 */

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { InformasiPageSkeleton } from "@/components/shared";

// Lazy load komponen untuk performa lebih baik
const BahanBangunanPage = dynamic(
  () => import("@/components/informasi/BahanBangunanPage"),
  { loading: () => <InformasiPageSkeleton /> }
);

const FaqPage = dynamic(
  () => import("@/components/informasi/FaqPage"),
  { loading: () => <InformasiPageSkeleton /> }
);

const KontakPage = dynamic(
  () => import("@/components/informasi/KontakPage"),
  { loading: () => <InformasiPageSkeleton /> }
);

const PeraturanPage = dynamic(
  () => import("@/components/informasi/PeraturanPage"),
  { loading: () => <InformasiPageSkeleton /> }
);

const PerizinanPage = dynamic(
  () => import("@/components/informasi/PerizinanPage"),
  { loading: () => <InformasiPageSkeleton /> }
);

const TentangPage = dynamic(
  () => import("@/components/informasi/TentangPage"),
  { loading: () => <InformasiPageSkeleton /> }
);

// Map slug ke komponen
const pageComponents: Record<string, React.ComponentType> = {
  "bahan-bangunan": BahanBangunanPage,
  faq: FaqPage,
  kontak: KontakPage,
  peraturan: PeraturanPage,
  perizinan: PerizinanPage,
  tentang: TentangPage,
};

interface InformasiParams {
  slug: string;
}

export default async function InformasiDynamicPage({
  params,
}: {
  params: Promise<InformasiParams>;
}) {
  const { slug } = await params;

  const PageComponent = pageComponents[slug];

  if (!PageComponent) {
    notFound();
  }

  return <PageComponent />;
}

// Generate static params untuk optimasi build
export function generateStaticParams() {
  return Object.keys(pageComponents).map((slug) => ({ slug }));
}
