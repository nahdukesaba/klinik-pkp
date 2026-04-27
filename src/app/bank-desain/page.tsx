/**
 * Route: /bank-desain
 *
 * Halaman Bank Desain - koleksi desain rumah dan rusun.
 * Filter kategori, pencarian, preview gambar, dan download PDF.
 */

import dynamic from "next/dynamic";

import { BankDesainPageSkeleton } from "@/components/shared";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bank Desain - Klinik PKP",
  description:
    "Koleksi desain rumah dan rusun beserta pratinjau gambar serta dokumen yang dapat diunduh untuk referensi pembangunan.",
};

const BankDesainPage = dynamic(
  () => import("@/components/bank-desain/BankDesainPage"),
  {
    loading: () => <BankDesainPageSkeleton />,
    ssr: true,
  }
);

export default BankDesainPage;
