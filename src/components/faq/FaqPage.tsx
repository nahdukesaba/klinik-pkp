"use client";

import Link from "next/link";

import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  RefreshCcw,
  Search,
} from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { ApiErrorState, GridPagination } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useFaqPage } from "@/hooks/faq/use-faq-page";
import { HUBUNGI_KAMI_HREF, KONSULTASI_HREF } from "@/lib/constants";
import { cn } from "@/lib/utils";

function FaqListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-card p-5 shadow-sm"
        >
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-11/12" />
        </div>
      ))}
    </div>
  );
}

export default function FaqPage() {
  const {
    isLoading,
    isError,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    openItemId,
    toggleItem,
    resetSearch,
    paginatedFaqs,
    currentPage,
    totalPages,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
  } = useFaqPage();

  if (isError) {
    return <ApiErrorState error={error} onRetry={refetch} />;
  }

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-14 pt-24">
        <div className="container mx-auto px-4">
          <section className="mx-auto max-w-3xl text-center">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:text-left">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HelpCircle className="h-6 w-6" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                FAQ Klinik PKP
              </h1>
            </div>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              Temukan jawaban cepat untuk hal yang paling sering ditanyakan,
              tanpa perlu menebak layanan mana yang sesuai.
            </p>
          </section>

          <section className="mx-auto mt-7 max-w-3xl rounded-lg border border-border bg-card p-4 shadow-sm">
            <label
              htmlFor="faq-search"
              className="text-sm font-semibold text-foreground"
            >
              Cari pertanyaan
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="faq-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Ketik kata kunci pertanyaan Anda..."
                className="min-h-11 w-full rounded-lg border border-border bg-background pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </section>

          <section className="mx-auto mt-6 max-w-3xl">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Pertanyaan yang sering diajukan
              </h2>

              {hasSearch ? (
                <button
                  type="button"
                  onClick={resetSearch}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Hapus pencarian
                </button>
              ) : null}
            </div>

            {isLoading ? (
              <FaqListSkeleton />
            ) : paginatedFaqs.length > 0 ? (
              <>
                <div className="space-y-3">
                  {paginatedFaqs.map((item) => {
                    const isOpen = openItemId === item.id;

                    return (
                      <article
                        key={item.id}
                        className={cn(
                          "overflow-hidden rounded-lg border bg-card shadow-sm transition-colors",
                          isOpen
                            ? "border-primary/45 shadow-md"
                            : "border-border hover:border-primary/25"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
                          aria-expanded={isOpen}
                        >
                          <h3 className="text-sm font-semibold leading-6 text-foreground sm:text-base">
                            {item.question}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-transform",
                              isOpen && "rotate-180 text-primary"
                            )}
                            aria-hidden="true"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        </button>

                        {isOpen ? (
                          <div className="border-t border-border px-4 py-3">
                            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                              {item.answer}
                            </p>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>

                <GridPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onPrev={goToPrevPage}
                  onNext={goToNextPage}
                />
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card px-5 py-12 text-center shadow-sm">
                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/70" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  Pertanyaan belum ditemukan
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-base leading-7 text-muted-foreground">
                  Coba kata kunci lain atau hubungi tim Klinik PKP untuk
                  bantuan lebih lanjut.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Hapus pencarian
                  </button>
                  <Link
                    href={KONSULTASI_HREF}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Buka Konsultasi
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="mx-auto mt-8 max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Masih butuh bantuan?
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Tim Klinik PKP dapat membantu mengarahkan pertanyaan Anda ke
                  layanan yang sesuai.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={KONSULTASI_HREF}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Konsultasi
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={HUBUNGI_KAMI_HREF}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  Hubungi Kami
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
