/** Komponen shared untuk state loading dan error saat fetch API. */

"use client";

import {
  AlertTriangle,
  RefreshCw,
  ServerOff,
  ShieldOff,
  WifiOff,
  Clock,
} from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { ApiError } from "@/lib/api-client";

// --- Loading State ---

interface ApiLoadingStateProps {
  /** Pesan loading yang ditampilkan */
  message?: string;
  /** Kelas CSS tambahan untuk container */
  className?: string;
  /** Tampilkan dalam layout penuh (dengan Navbar & Footer) */
  fullPage?: boolean;
}

/**
 * Tampilan loading saat data sedang diambil dari API.
 * Menampilkan spinner animasi dengan pesan informatif.
 */
export function ApiLoadingState({
  message,
  className = "",
  fullPage = true,
}: ApiLoadingStateProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 ${className}`}>
      <div className="h-16 w-16 animate-pulse rounded-full bg-primary/20" />
      {message ? (
        <p className="text-center text-sm font-medium text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );

  if (!fullPage) return content;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-20">
        {content}
      </main>
      <Footer />
    </div>
  );
}

// --- Error State — status-aware ---

/**
 * Konfigurasi tampilan error berdasarkan tipe error.
 * Setiap tipe memiliki ikon, warna, dan pesan default yang berbeda.
 */
interface ErrorDisplay {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

/** Tentukan tampilan error berdasarkan ApiError atau generic Error */
function getErrorDisplay(error?: unknown): ErrorDisplay {
  if (error instanceof ApiError) {
    // Server sedang mati / maintenance (5xx)
    if (error.isServerError) {
      return {
        icon: <ServerOff className="w-8 h-8 text-destructive" />,
        title: error.status === 503 ? "Server Dalam Pemeliharaan" : "Kesalahan Server",
        description: error.userMessage,
        bgColor: "bg-destructive/10",
      };
    }

    // Akses ditolak (403)
    if (error.status === 403) {
      return {
        icon: <ShieldOff className="w-8 h-8 text-orange-500" />,
        title: "Akses Ditolak",
        description: error.userMessage,
        bgColor: "bg-orange-500/10",
      };
    }

    // Timeout (408)
    if (error.status === 408) {
      return {
        icon: <Clock className="w-8 h-8 text-yellow-500" />,
        title: "Waktu Habis",
        description: error.userMessage,
        bgColor: "bg-yellow-500/10",
      };
    }

    // Terlalu banyak request (429)
    if (error.status === 429) {
      return {
        icon: <Clock className="w-8 h-8 text-yellow-500" />,
        title: "Terlalu Banyak Permintaan",
        description: error.userMessage,
        bgColor: "bg-yellow-500/10",
      };
    }

    // Network error (status 0 — server mati, tidak ada internet)
    if (error.isNetworkError) {
      return {
        icon: <WifiOff className="w-8 h-8 text-muted-foreground" />,
        title: "Tidak Dapat Terhubung",
        description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba lagi nanti.",
        bgColor: "bg-muted",
      };
    }

    // Client error lainnya (400, 401, 404, dll.)
    return {
      icon: <AlertTriangle className="w-8 h-8 text-orange-500" />,
      title: "Data Tidak Tersedia",
      description: error.userMessage,
      bgColor: "bg-orange-500/10",
    };
  }

  // Generic error (bukan ApiError)
  const genericMessage =
    error instanceof Error &&
    error.message.trim() !== "" &&
    error.message.trim().toLowerCase() !== "success"
      ? error.message.trim()
      : "Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil dan coba lagi.";

  return {
    icon: <ServerOff className="w-8 h-8 text-destructive" />,
    title: "Data Tidak Tersedia",
    description: genericMessage,
    bgColor: "bg-destructive/10",
  };
}

interface ApiErrorStateProps {
  /** Error object — jika ApiError, akan menampilkan pesan status-spesifik */
  error?: unknown;
  /** Override judul error */
  title?: string;
  /** Override deskripsi error */
  message?: string;
  /** Callback untuk tombol coba ulang */
  onRetry?: () => void;
  /** Kelas CSS tambahan untuk container */
  className?: string;
  /** Tampilkan dalam layout penuh (dengan Navbar & Footer) */
  fullPage?: boolean;
}

/**
 * Tampilan error saat API gagal diakses.
 * Otomatis menampilkan ikon dan pesan yang sesuai berdasarkan HTTP status:
 *
 * - **5xx** (Server Error): Ikon server mati, pesan maintenance
 * - **403** (Forbidden): Ikon shield, pesan akses ditolak
 * - **408** (Timeout): Ikon jam, pesan waktu habis
 * - **429** (Rate Limit): Ikon jam, pesan terlalu banyak request
 * - **Network Error**: Ikon wifi mati, pesan koneksi
 * - **Lainnya**: Ikon peringatan, pesan umum
 */
export function ApiErrorState({
  error,
  title,
  message,
  onRetry,
  className = "",
  fullPage = true,
}: ApiErrorStateProps) {
  const display = getErrorDisplay(error);

  // Status code badge — tampilkan hanya jika ada status code
  const statusCode = error instanceof ApiError && error.status > 0
    ? error.status
    : null;

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 ${className}`}>
      <div className={`w-16 h-16 rounded-full ${display.bgColor} flex items-center justify-center`}>
        {display.icon}
      </div>
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-foreground">
            {title ?? display.title}
          </h3>
          {statusCode && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted text-muted-foreground">
              {statusCode}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {message ?? display.description}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      )}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mt-2">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Jika masalah berlanjut, hubungi administrator</span>
      </div>
    </div>
  );

  if (!fullPage) return content;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-20">
        {content}
      </main>
      <Footer />
    </div>
  );
}
