// ============================================
// ROUTE: /berita/[id]
// DESKRIPSI: Halaman detail berita (dynamic route)
//
// CARA KERJA:
// - File ini WAJIB bernama "page.tsx" (requirement Next.js)
// - Folder [id] menangkap parameter dari URL
// - Contoh: /berita/1 → params.id = "1"
//           /berita/123 → params.id = "123"
//
// SAAT PAKAI API BACKEND:
// - Edit BeritaDetailContent.tsx untuk fetch dari API
// - File ini tidak perlu diubah
// ============================================

import BeritaDetailContent from "./BeritaDetailContent";

export default BeritaDetailContent;
