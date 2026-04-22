/**
 * Root Error Boundary — menangkap error rendering di semua halaman.
 *
 * Tanpa file ini, error komponen akan crash seluruh aplikasi.
 * Dengan error boundary, hanya halaman yang error yang terpengaruh
 * dan user bisa retry tanpa refresh browser.
 *
 * Ref: nextjs-app-router-patterns/file-conventions
 */

"use client";

import { useEffect } from "react";

import Link from "next/link";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  unstable_retry: unstableRetry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  const retry = unstableRetry ?? reset;

  useEffect(() => {
    // Log error ke console di development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3">
          Terjadi Kesalahan
        </h2>
        <p className="text-muted-foreground mb-8">
          Maaf, terjadi kesalahan saat memuat halaman ini.
          Silakan coba lagi atau kembali ke beranda.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => retry?.()}
            disabled={!retry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
