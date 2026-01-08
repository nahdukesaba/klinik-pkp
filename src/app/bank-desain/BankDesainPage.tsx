"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import {
  Bath,
  BedDouble,
  Car,
  Download,
  Eye,
  Maximize2,
  Palette,
  Search,
} from "lucide-react";

import { DesignPreviewDialog } from "@/components/bank-desain/DesignPreviewDialog";
import { Footer, Navbar } from "@/components/layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  designCategories,
  designsList,
  type Design,
} from "@/data/bank-desain";
import useScrollAnimation from "@/hooks/use-scroll-animation";

// ============================================
// Constants
// ============================================
const DEFAULT_CATEGORY = "all";

// ============================================
// Main Page Component
// Menampilkan grid desain rumah dan rusun dengan fitur:
// - Filter berdasarkan kategori
// - Pencarian berdasarkan judul
// - Preview dengan zoom
// - Download PDF
// ============================================
export default function BankDesainPage() {
  const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDesign, setPreviewDesign] = useState<Design | null>(null);
  const ref = useScrollAnimation();

  // Filter designs based on category and search
  const filteredDesigns = useMemo(() => {
    return designsList.filter((design) => {
      const matchesCategory =
        activeCategory === DEFAULT_CATEGORY || design.category === activeCategory;
      const matchesSearch = design.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handlePreview = (design: Design) => {
    setPreviewDesign(design);
  };

  const handleClosePreview = () => {
    setPreviewDesign(null);
  };

  const handleDownloadPdf = (pdfUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = pdfUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pt-24 pb-16">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <Palette className="w-4 h-4" />
              <span>Bank Desain</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Koleksi Desain Rumah & Rusun
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Temukan berbagai desain rumah dan rusun yang dapat menjadi
              inspirasi untuk pembangunan hunian Anda.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-on-scroll">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cari desain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card">
                <SelectValue placeholder="Filter Tipe" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {designCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Design Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredDesigns.length > 0 ? (
              filteredDesigns.map((design, index) => (
                <div
                  key={design.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all shadow-md hover:shadow-xl group opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-secondary relative overflow-hidden">
                    <Image
                      src={design.image}
                      alt={design.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground text-lg mb-3">
                      {design.title}
                    </h3>

                    {/* Facilities */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BedDouble className="w-4 h-4 text-primary" />
                        <span>{design.bedrooms} Kamar Tidur</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bath className="w-4 h-4 text-primary" />
                        <span>{design.bathrooms} Kamar Mandi</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Maximize2 className="w-4 h-4 text-primary" />
                        <span>{design.area} m²</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Car className="w-4 h-4 text-primary" />
                        <span>
                          {design.carport ? "Ada Carport" : "Tanpa Carport"}
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePreview(design)}
                        className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={(e) => handleDownloadPdf(design.pdfUrl, e)}
                        className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Unduh PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Empty State */}
          {filteredDesigns.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Palette className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Tidak Ada Desain Ditemukan
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Coba ubah filter atau kata kunci pencarian Anda.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Preview Dialog */}
      <DesignPreviewDialog
        design={previewDesign}
        isOpen={!!previewDesign}
        onClose={handleClosePreview}
      />
    </div>
  );
}
