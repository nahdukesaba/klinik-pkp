/**
 * Route: /bank-desain
 *
 * Halaman Bank Desain — koleksi desain rumah dan rusun.
 * Filter kategori, pencarian, preview gambar, dan download PDF.
 */

import dynamic from "next/dynamic";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bank Desain — Klinik PKP",
  description:
    "Koleksi desain rumah tipe 36, 45, 54, dan rusun. Preview gambar dan download PDF desain.",
};

// Skeleton loading untuk BankDesainPage
function BankDesainSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-8 w-32 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-10 w-64 bg-muted rounded mx-auto mb-4" />
            <div className="h-6 w-96 bg-muted rounded mx-auto" />
          </div>
          <div className="flex gap-3 justify-center mb-8 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Lazy load BankDesainPage
const BankDesainPage = dynamic(
  () => import("@/components/bank-desain/BankDesainPage"),
  { 
    loading: () => <BankDesainSkeleton />,
    ssr: true 
  }
);

export default BankDesainPage;
