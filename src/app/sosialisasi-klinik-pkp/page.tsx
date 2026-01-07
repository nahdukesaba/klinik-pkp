/**
 * Sosialisasi Klinik PKP Page Route
 *
 * Halaman untuk menampilkan informasi sosialisasi dan edukasi
 * terkait perumahan dan kawasan permukiman.
 *
 * Struktur:
 * - page.tsx (routing) → SosialisasiKlinikPage.tsx (main content)
 *
 * Sections:
 * 1. Peta Lokasi Sosialisasi (PKPMapSection)
 * 2. Jadwal Kegiatan Mendatang (PKPJadwalSection)
 * 3. Berita Sosialisasi (PKPBeritaSection)
 *
 * Hooks:
 * - useSosialisasiPKPMap: Logic untuk peta dan marker
 * - useSosialisasiPKPJadwal: Filter dan pagination jadwal
 * - useSosialisasiPKPBerita: Filter berita
 *
 * Data: src/data/sosialisasi-klinik.ts
 */

import SosialisasiKlinikPage from './SosialisasiKlinikPage';

export const dynamic = 'force-dynamic';

export default SosialisasiKlinikPage;