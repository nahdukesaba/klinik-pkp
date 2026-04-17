/**
 * Client wrapper untuk lazy-load SosialisasiKlinikPage.
 * Dipisahkan karena `dynamic({ ssr: false })` hanya diizinkan di Client Component (Next.js 16+).
 */

"use client";

import dynamic from "next/dynamic";

import { SosialisasiPageSkeleton } from "@/components/shared";

/** Lazy load karena peta dan DOM interaktif membutuhkan browser APIs. */
const SosialisasiKlinikPage = dynamic(
  () => import("@/components/sosialisasi-pkp/SosialisasiKlinikPage"),
  {
    loading: () => <SosialisasiPageSkeleton />,
    ssr: false,
  }
);

export default SosialisasiKlinikPage;
