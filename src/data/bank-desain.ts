/**
 * Bank Desain Data
 * Data desain rumah untuk halaman Bank Desain
 * 
 * CATATAN UNTUK DEVELOPER:
 * Struktur ini dirancang untuk mudah diintegrasikan dengan API backend (Golang).
 * Kategori bersifat dinamis dan dapat diisi dari dashboard admin.
 * 
 * @example Integrasi dengan API:
 * ```typescript
 * // Fetch dari API
 * const { designs, categories } = await fetch('/api/bank-desain').then(r => r.json());
 * // Gunakan langsung dengan komponen
 * ```
 */

// ============================================
// Types & Interfaces
// ============================================

/** 
 * Kategori filter yang dinamis
 * Dapat diisi dari API atau data statis
 */
export interface FilterCategory {
  id: string;
  label: string;
}

/**
 * Struktur kategori untuk semua filter
 * Struktur ini akan diisi dari API nantinya
 */
export interface FilterCategories {
  type: FilterCategory[];
  bedroom: FilterCategory[];
  teras: FilterCategory[];
}

/**
 * Interface desain rumah
 * Sesuai dengan response dari API backend
 */
export interface Design {
  id: number;
  /** Kode desain untuk identifikasi (misal: 001, 002) */
  code: string;
  title: string;
  /** Tipe rumah - dinamis dari API (T36, T45, dll) */
  type: string;
  /** Kategori teras - dinamis dari API */
  terasFeature: string;
  /** Thumbnail untuk card */
  thumbnail: string;
  /** Jumlah kamar tidur */
  bedrooms: number;
  /** Jumlah kamar mandi */
  bathrooms: number;
  /** Luas bangunan dalam m² */
  area: number;
  /** Gambar-gambar untuk preview (denah, tampak depan, dll) */
  previewImages: string[];
  /** URL file RAB PDF */
  rabPdfUrl: string;
  /** URL file desain (gambar/PDF) untuk diunduh */
  designFileUrl?: string;
  /** Deskripsi singkat desain */
  description?: string;
}

// ============================================
// Filter Categories (Dynamic - API Ready)
// ============================================

/**
 * Default filter categories
 * Nantinya akan diganti dengan data dari API
 * 
 * @example Penggunaan dengan API:
 * ```typescript
 * const [categories, setCategories] = useState(defaultFilterCategories);
 * useEffect(() => {
 *   fetch('/api/categories').then(r => r.json()).then(setCategories);
 * }, []);
 * ```
 */
export const defaultFilterCategories: FilterCategories = {
  type: [
    { id: "all", label: "Semua Tipe" },
    { id: "T36", label: "Tipe 36 (36 m²)" },
  ],
  bedroom: [
    { id: "all", label: "Semua Kamar" },
    { id: "1", label: "1 Kamar Tidur" },
    { id: "2", label: "2 Kamar Tidur" },
    { id: "3", label: "3 Kamar Tidur" },
  ],
  teras: [
    { id: "all", label: "Semua" },
    { id: "dengan-teras", label: "Dengan Teras" },
    { id: "tanpa-teras", label: "Tanpa Teras" },
  ],
};

// ============================================
// Helper Functions
// ============================================

/**
 * Generate preview images path dari folder desain
 * Utility untuk membuat array path gambar berurutan
 * 
 * @param folderName - nama folder (misal: "bank-desain-001")
 * @param prefix - prefix file (misal: "001")
 * @param count - jumlah gambar
 * @returns Array path gambar
 */
export function generatePreviewImages(
  folderName: string, 
  prefix: string, 
  count: number
): string[] {
  return Array.from({ length: count }, (_, i) => 
    `/${folderName}/${prefix}-${String(i + 1).padStart(2, "0")}.png`
  );
}

/**
 * Generate URL unduhan untuk desain
 * Menggabungkan semua gambar preview sebagai referensi
 * 
 * @param design - Data desain
 * @returns URL file desain utama atau thumbnail
 */
export function getDesignDownloadUrl(design: Design): string {
  return design.designFileUrl || design.previewImages[0] || design.thumbnail;
}

// ============================================
// Design Data (Static - akan diganti API)
// ============================================

/**
 * Data desain statis
 * Nantinya akan diganti dengan fetch dari API
 * 
 * @example Penggunaan dengan API:
 * ```typescript
 * const [designs, setDesigns] = useState<Design[]>([]);
 * useEffect(() => {
 *   fetch('/api/designs').then(r => r.json()).then(setDesigns);
 * }, []);
 * ```
 */
export const designsList: Design[] = [
  {
    id: 1,
    code: "001",
    title: "Rumah Tipe 36 Standar",
    type: "T36",
    terasFeature: "dengan-teras",
    thumbnail: "/bank-desain-001/001-01.png",
    bedrooms: 2,
    bathrooms: 1,
    area: 36,
    previewImages: generatePreviewImages("bank-desain-001", "001", 8),
    rabPdfUrl: "/bank-desain-001/001.pdf",
    designFileUrl: "/bank-desain-001/001.pdf", // PDF berisi semua gambar desain
    description: "Desain rumah tipe 36 dengan 2 kamar tidur, 1 kamar mandi, dan teras depan. Cocok untuk keluarga kecil.",
  },
];
