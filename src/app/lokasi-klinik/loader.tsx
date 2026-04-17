/**
 * Client wrapper untuk lazy-load LokasiKlinikPage.
 * Dipisahkan karena `dynamic({ ssr: false })` hanya diizinkan di Client Component (Next.js 16+).
 */

"use client";

import dynamic from "next/dynamic";

import { LokasiKlinikPageSkeleton } from "@/components/shared";

/** Lazy load karena Leaflet butuh window/document. */
const LokasiKlinikPage = dynamic(
  () => import("@/components/lokasi-klinik/LokasiKlinikPage"),
  {
    loading: () => <LokasiKlinikPageSkeleton />,
    ssr: false,
  }
);

export default LokasiKlinikPage;
