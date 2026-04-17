/**
 * Client wrapper untuk lazy-load SebaranRusunPage.
 * Dipisahkan karena `dynamic({ ssr: false })` hanya diizinkan di Client Component (Next.js 16+).
 * Page.tsx tetap Server Component agar bisa export metadata untuk SEO.
 */

"use client";

import dynamic from "next/dynamic";

import { MapLazySectionSkeleton } from "@/components/shared";

/** Lazy load - ssr:false karena Leaflet butuh window/document */
const SebaranRusunPage = dynamic(
  () => import("@/components/sebaran-rusun/SebaranRusunPage"),
  {
    loading: () => (
      <MapLazySectionSkeleton sidebarCardHeights={["h-40", "h-64"]} />
    ),
    ssr: false,
  }
);

export default SebaranRusunPage;
