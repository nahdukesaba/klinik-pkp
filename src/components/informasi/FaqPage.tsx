"use client";

import { useState, useMemo } from "react";

import {
  ChevronDown,
  FileCheck,
  HelpCircle,
  Home,
  Search,
  Users,
  Wallet,
} from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { faqCategories, faqList } from "@/content/informasi";
import { useDebounce } from "@/hooks/use-debounce";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Home,
  FileCheck,
  Users,
  Wallet,
};

export default function FAQPage() {
  const ref = useScrollAnimation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Debounce search untuk performa lebih baik
  const debouncedSearchQuery = useDebounce(searchQuery, 250);

  const filteredFaqs = useMemo(() => {
    return faqList.filter((faq) => {
      const matchesSearch =
        faq.q.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pt-24 pb-16">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent-2/10" />
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-accent-2/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Temukan jawaban atas pertanyaan umum seputar program perumahan dan
              layanan kami.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-10 animate-on-scroll">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cari pertanyaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-card border-border"
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:border-primary/50"
                }`}
              >
                Semua
              </button>
              {faqCategories.map((cat) => {
                const IconComponent = iconMap[cat.iconName];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all inline-flex items-center gap-2 ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border border-border overflow-hidden animate-on-scroll"
                style={{ transitionDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="font-medium text-foreground pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <HelpCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-muted-foreground">
                  Coba ubah kata kunci atau filter pencarian Anda.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
