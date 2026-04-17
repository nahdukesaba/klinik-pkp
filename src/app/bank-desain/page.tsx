/**
 * Route: /bank-desain
 *
 * Halaman Bank Desain — koleksi desain rumah dan rusun.
 * Filter kategori, pencarian, preview gambar, dan download PDF.
 */

import dynamic from "next/dynamic";

import { BankDesainPageSkeleton } from "@/components/shared";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bank Desain — Klinik PKP",
  description:
    "Koleksi desain rumah tipe 36, 45, 54, dan rusun. Preview gambar dan download PDF desain.",
};

// Lazy load BankDesainPage
const BankDesainPage = dynamic(
  () => import("@/components/bank-desain/BankDesainPage"),
  {
    loading: () => <BankDesainPageSkeleton />,
    ssr: true,
  }
);

export default BankDesainPage;
