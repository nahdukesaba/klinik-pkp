"use client";

import Image from "next/image";
import Link from "next/link";

import { Calendar, MapPin, ArrowRight } from "lucide-react";

import { beritaSosialisasiList } from "@/data/sosialisasi-klinik";

// ============================================
// BeritaListContent Component
// DESKRIPSI: Halaman list semua berita
//
// SAAT PAKAI API BACKEND:
// - Ganti beritaSosialisasiList dengan fetch dari API
// - Contoh: const { data } = useSWR('/api/berita')
// ============================================
export default function BeritaListContent() {
  // Sort berita by newest first (descending)
  const sortedBerita = [...beritaSosialisasiList].sort(
    (a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Berita Sosialisasi Klinik PKP
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Informasi terkini tentang kegiatan sosialisasi Klinik Perumahan dan Kawasan Permukiman
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedBerita.map((berita) => (
            <Link
              key={berita.id}
              href={`/berita/${berita.id}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                <Image
                  src={berita.image}
                  alt={berita.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                  {berita.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {berita.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{berita.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{berita.kabupaten}</span>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 font-medium">
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
