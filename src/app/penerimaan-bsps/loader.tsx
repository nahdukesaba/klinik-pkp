/**
 * Client wrapper untuk lazy-load PenerimaanBspsPage.
 * Dipisahkan karena `dynamic({ ssr: false })` hanya diizinkan di Client Component (Next.js 16+).
 */

"use client";

import dynamic from "next/dynamic";

import { MapLazySectionSkeleton } from "@/components/shared";

/** Lazy load - ssr:false karena Leaflet butuh window/document */
const PenerimaanBspsPage = dynamic(
  () => import("@/components/penerimaan-bsps/PenerimaanBspsPage"),
  {
    loading: () => <MapLazySectionSkeleton />,
    ssr: false,
  }
);

export default PenerimaanBspsPage;
