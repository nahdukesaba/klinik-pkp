/**
 * Route: /informasi/[slug]
 * 
 * Dynamic route untuk halaman-halaman informasi.
 * FILE INI HANYA UNTUK ROUTING!
 * Komponen UI ada di: @/components/informasi/
 */

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

// Lazy load komponen untuk performa lebih baik
const BahanBangunanPage = dynamic(
  () => import("@/components/informasi/BahanBangunanPage"),
  { loading: () => <PageSkeleton /> }
);

const FaqPage = dynamic(
  () => import("@/components/informasi/FaqPage"),
  { loading: () => <PageSkeleton /> }
);

const KontakPage = dynamic(
  () => import("@/components/informasi/KontakPage"),
  { loading: () => <PageSkeleton /> }
);

const PeraturanPage = dynamic(
  () => import("@/components/informasi/PeraturanPage"),
  { loading: () => <PageSkeleton /> }
);

const PerizinanPage = dynamic(
  () => import("@/components/informasi/PerizinanPage"),
  { loading: () => <PageSkeleton /> }
);

const TentangPage = dynamic(
  () => import("@/components/informasi/TentangPage"),
  { loading: () => <PageSkeleton /> }
);

// Loading skeleton
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-muted" />
      <div className="container mx-auto px-4 py-24">
        <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-12" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

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
