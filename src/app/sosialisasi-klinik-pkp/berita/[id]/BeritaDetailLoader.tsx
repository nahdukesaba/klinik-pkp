/**
 * Client wrapper untuk lazy-load BeritaDetailPage (ssr: false).
 * Digunakan oleh page.tsx (Server Component) untuk mendukung generateMetadata.
 */

"use client";

import dynamic from "next/dynamic";

function BeritaDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 w-24 bg-muted rounded mb-6" />
            <div className="aspect-video bg-muted rounded-2xl mb-6" />
            <div className="h-10 w-3/4 bg-muted rounded mb-4" />
            <div className="h-6 w-1/2 bg-muted rounded mb-6" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BeritaDetailPage = dynamic(
  () => import("@/components/berita/BeritaDetailPage"),
  {
    loading: () => <BeritaDetailSkeleton />,
    ssr: false,
  }
);

export default BeritaDetailPage;
