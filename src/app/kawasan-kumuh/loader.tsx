/**
 * Client wrapper untuk lazy-load KawasanKumuhPage.
 * Dipisahkan karena `dynamic({ ssr: false })` hanya diizinkan di Client Component (Next.js 16+).
 */

"use client";

import dynamic from "next/dynamic";

import { MapLazySectionSkeleton } from "@/components/shared";

/** Lazy load - ssr:false karena Leaflet butuh window/document */
const KawasanKumuhPage = dynamic(
  () => import("@/components/kawasan-kumuh/KawasanKumuhPage"),
  {
    loading: () => <MapLazySectionSkeleton />,
    ssr: false,
  }
);

export default KawasanKumuhPage;
