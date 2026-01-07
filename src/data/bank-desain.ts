/**
 * Bank Desain Data
 * Data desain rumah untuk halaman Bank Desain
 */

export interface Design {
  id: number;
  title: string;
  category: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  carport: boolean;
  previewImages: string[];
  pdfUrl: string;
}

export interface DesignCategory {
  id: string;
  label: string;
}

export const designCategories: DesignCategory[] = [
  { id: "all", label: "Semua Tipe" },
  { id: "rumah-36", label: "Tipe 36" },
  { id: "rumah-45", label: "Tipe 45" },
  { id: "rumah-54", label: "Tipe 54" },
  { id: "rusun", label: "Rusun" },
];

export const designsList: Design[] = [
  {
    id: 1,
    title: "Rumah Tipe 36 Minimalis",
    category: "rumah-36",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    area: 36,
    carport: false,
    previewImages: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    ],
    pdfUrl: "/sample.pdf",
  },
  {
    id: 2,
    title: "Rumah Tipe 45 Modern",
    category: "rumah-45",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    area: 45,
    carport: true,
    previewImages: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    ],
    pdfUrl: "/sample.pdf",
  },
  {
    id: 3,
    title: "Rumah Tipe 54 Tropis",
    category: "rumah-54",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    area: 54,
    carport: true,
    previewImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
    ],
    pdfUrl: "/sample.pdf",
  },
  {
    id: 4,
    title: "Rusun Blok A",
    category: "rusun",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    area: 36,
    carport: false,
    previewImages: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    ],
    pdfUrl: "/sample.pdf",
  },
  {
    id: 5,
    title: "Rumah Tipe 36 Compact",
    category: "rumah-36",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    area: 36,
    carport: false,
    previewImages: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    ],
    pdfUrl: "/sample.pdf",
  },
  {
    id: 6,
    title: "Rumah Tipe 45 Klasik",
    category: "rumah-45",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
    bedrooms: 3,
    bathrooms: 1,
    area: 45,
    carport: true,
    previewImages: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop",
    ],
    pdfUrl: "/sample.pdf",
  },
];
