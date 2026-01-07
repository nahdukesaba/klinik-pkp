"use client";

import { useState, useMemo } from "react";

import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";

import { Calendar, MapPin, ArrowLeft, ChevronLeft, ChevronRight, Users } from "lucide-react";

import { RelatedNewsCard } from "@/components/berita/RelatedNewsCard";
import { Footer, Navbar } from "@/components/layout";
import { ImageCarouselZoom, useCarouselPreview } from "@/components/ui/ImageZoom";
import { beritaSosialisasiList } from "@/data/sosialisasi-klinik";

// ============================================
// Types
// ============================================
interface BeritaData {
  id: number;
  title: string;
  description: string;
  kabupaten: string;
  image: string;
  images?: string[];
  rawDate: string;
  date: string;
  peserta?: number;
  coordinates: [number, number];
}

// ============================================
// Custom Cursor Style
// ============================================
const cursorZoomIn = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3Cline x1='11' y1='8' x2='11' y2='14'/%3E%3Cline x1='8' y1='11' x2='14' y2='11'/%3E%3C/svg%3E") 16 16, zoom-in`;

// ============================================
// BeritaDetailContent Component
// CATATAN: File ini berisi logic & UI untuk detail berita
// Nanti saat pakai API backend, ubah beritaSosialisasiList dengan fetch API
// ============================================
export default function BeritaDetailContent() {
  const params = useParams();
  const id = Number(params.id);
  
  // TODO: Ganti dengan API call saat backend ready
  // const { data: berita } = useSWR(`/api/berita/${id}`)
  const berita = useMemo(() => {
    return beritaSosialisasiList.find((b) => b.id === id) as BeritaData | undefined;
  }, [id]);
  
  // Get related berita (sorted by newest first)
  const relatedBerita = useMemo(() => {
    if (!berita) return [];
    return beritaSosialisasiList
      .filter((b) => b.id !== id && b.kabupaten === berita.kabupaten)
      .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      .slice(0, 5) as BeritaData[];
  }, [berita, id]);
  
  const displayRelatedBerita = useMemo(() => {
    if (relatedBerita.length >= 5) return relatedBerita;
    const otherBerita = beritaSosialisasiList
      .filter((b) => b.id !== id && !relatedBerita.find((r) => r.id === b.id))
      .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      .slice(0, 5 - relatedBerita.length) as BeritaData[];
    return [...relatedBerita, ...otherBerita];
  }, [relatedBerita, id]);
  
  // Image carousel state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carousel = useCarouselPreview();
  
  const allImages = useMemo(() => {
    if (!berita) return [];
    const images = [berita.image];
    if (berita.images) {
      images.push(...berita.images);
    }
    return images;
  }, [berita]);
  
  if (!berita) {
    notFound();
  }
  
  const eventDate = new Date(berita.rawDate);
  const dayName = eventDate.toLocaleDateString("id-ID", { weekday: "long" });
  const formattedDate = `${eventDate.getDate()} ${eventDate.toLocaleDateString("id-ID", { month: "long" })} ${eventDate.getFullYear()}`;
  
  const handleMainImageClick = () => {
    carousel.openCarousel(allImages, activeImageIndex, berita.title);
  };
  
  const goToPrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };
  
  const goToNextImage = () => {
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 pt-20">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <Link href="/sosialisasi-klinik-pkp" className="hover:text-primary transition-colors">
                Sosialisasi
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium line-clamp-1">{berita.title}</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Main Content */}
            <article className="flex-1 w-full lg:max-w-4xl">
              <Link
                href="/sosialisasi-klinik-pkp"
                className="inline-flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-primary transition-colors mb-4 md:mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Sosialisasi
              </Link>
              
              <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-3 md:mb-4 leading-tight">
                {berita.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm">{dayName}, {formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm">{berita.kabupaten}</span>
                </div>
                {berita.peserta && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                    <span className="text-xs md:text-sm">{berita.peserta} Peserta</span>
                  </div>
                )}
              </div>
              
              {/* Main Image */}
              <div className="mb-6 md:mb-8">
                <div 
                  className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-muted cursor-pointer group"
                  style={{ cursor: cursorZoomIn }}
                  onClick={handleMainImageClick}
                >
                  <Image
                    src={allImages[activeImageIndex]}
                    alt={berita.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    priority
                  />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg"
                        aria-label="Gambar sebelumnya"
                      >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg"
                        aria-label="Gambar selanjutnya"
                      >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </button>
                    </>
                  )}
                  
                  {allImages.length > 1 && (
                    <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 px-2.5 md:px-3 py-1 md:py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs md:text-sm text-white z-10">
                      {activeImageIndex + 1} / {allImages.length}
                    </div>
                  )}
                </div>
                
                {allImages.length > 1 && (
                  <div className="flex gap-2 mt-3 md:mt-4 overflow-x-auto pb-2 scrollbar-thin">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-12 md:w-20 md:h-14 flex-shrink-0 rounded-md md:rounded-lg overflow-hidden border-2 transition-all ${
                          idx === activeImageIndex
                            ? "border-primary scale-105"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  {berita.description}
                </p>
              </div>
            </article>
            
            {/* Sidebar */}
            <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">
                    Berita Terkait
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {displayRelatedBerita.map((item) => (
                      <RelatedNewsCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        image={item.image}
                        rawDate={item.rawDate}
                        kabupaten={item.kabupaten}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {carousel.state && (
        <ImageCarouselZoom
          images={carousel.state.images}
          currentIndex={carousel.state.currentIndex}
          alt={carousel.state.alt}
          isOpen={carousel.isOpen}
          onClose={carousel.closeCarousel}
          onIndexChange={(idx) => {
            carousel.setIndex(idx);
            setActiveImageIndex(idx);
          }}
        />
      )}
    </div>
  );
}
