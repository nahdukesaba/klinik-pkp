/**
 * Building Steps Data
 * Data tahapan pembangunan rumah untuk halaman landing.
 * Konten statis — tidak ada endpoint API untuk data ini.
 */

import {
  ClipboardList,
  FileCheck,
  Hammer,
  Home,
  Search,
  Wallet,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

// Type definition
export interface BuildingStep {
  id: string;
  icon: LucideIcon;
  step: number;
  title: string;
  description: string;
}

// Data tahapan pembangunan (landing page)
export const buildingStepsData: BuildingStep[] = [
  {
    id: "1",
    icon: ClipboardList,
    step: 1,
    title: "Perencanaan",
    description:
      "Tentukan kebutuhan, lokasi, dan anggaran pembangunan rumah Anda. Konsultasikan dengan ahli untuk hasil optimal.",
  },
  {
    id: "2",
    icon: Search,
    step: 2,
    title: "Survey Lokasi",
    description:
      "Periksa kondisi tanah, akses jalan, dan ketersediaan utilitas. Pastikan legalitas lahan sudah jelas.",
  },
  {
    id: "3",
    icon: Wallet,
    step: 3,
    title: "Pendanaan",
    description:
      "Siapkan dana atau ajukan KPR/bantuan BSPS jika memenuhi syarat. Hitung dengan matang termasuk biaya tak terduga.",
  },
  {
    id: "4",
    icon: Hammer,
    step: 4,
    title: "Konstruksi",
    description:
      "Lakukan pembangunan sesuai gambar teknis dan standar konstruksi.",
  },
  {
    id: "5",
    icon: FileCheck,
    step: 5,
    title: "Perizinan",
    description:
      "Urus IMB dan dokumen perizinan yang diperlukan untuk pembangunan. Lengkapi persyaratan administrasi.",
  },
  {
    id: "6",
    icon: Home,
    step: 6,
    title: "Serah Terima",
    description: "Pemeriksaan bangunan, Mengurus SLF, dan serah terima rumah.",
  },
];
