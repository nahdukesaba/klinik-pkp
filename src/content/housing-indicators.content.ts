/**
 * Housing Indicators Data
 * Data indikator kelayakan rumah untuk halaman landing.
 * Konten statis — tidak ada endpoint API untuk data ini.
 */

import {
  Maximize2,
  Sparkles,
  Shield,
  Droplets,
  MapPin,
  Waves,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

// Type definition
export interface HousingIndicator {
  id: string;
  image: string;
  icon: LucideIcon;
  title: string;
  checklist: string[];
}

// Data indikator kelayakan rumah (landing page)
export const housingIndicatorsData: HousingIndicator[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    icon: Maximize2,
    title: "Luas Rumah Memadai",
    checklist: [
      "Luas bangunan minimal 9m² per orang",
      "Ruang cukup untuk aktivitas keluarga",
      "Ventilasi udara memadai",
    ],
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    icon: Sparkles,
    title: "Kebersihan Terjaga",
    checklist: [
      "Bebas dari genangan air",
      "Tidak ada tumpukan sampah",
      "Bebas hewan berbahaya",
    ],
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
    icon: Shield,
    title: "Konstruksi Aman",
    checklist: [
      "Struktur bangunan kokoh",
      "Atap tidak bocor",
      "Dinding dan lantai kondisi baik",
    ],
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop",
    icon: Droplets,
    title: "Akses Air Bersih",
    checklist: [
      "Sumber air bersih tersedia",
      "Jarak sumber air terjangkau",
      "Kualitas air layak konsumsi",
    ],
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
    icon: MapPin,
    title: "Akses Jalan",
    checklist: [
      "Jalan dapat dilalui kendaraan",
      "Akses mudah ke fasilitas umum",
      "Kondisi jalan layak",
    ],
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1504386106331-3e4e71712b38?w=400&h=300&fit=crop",
    icon: Waves,
    title: "Drainase Baik",
    checklist: [
      "Saluran air berfungsi baik",
      "Tidak ada genangan saat hujan",
      "Limbah tersalur dengan benar",
    ],
  },
];
