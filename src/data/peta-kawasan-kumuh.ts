/**
 * Peta Data - Kawasan Kumuh
 * Data untuk halaman Peta Kawasan Kumuh
 */

export interface KawasanKumuh {
  id: string;
  name: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  lat: number;
  lng: number;
  luas: number;
  kk: number;
  status: "berat" | "sedang" | "ringan";
  tahun: number;
  legalitasLahan: "Legal" | "Tidak Legal";
  kondisiJalan: string;
  kondisiDrainase: string;
  aksesAirMinum: string;
}

export interface RegionCenter {
  lat: number;
  lng: number;
  zoom: number;
  name: string;
}

export const kawasanKumuhData: KawasanKumuh[] = [
  {
    id: "1",
    name: "Kawasan Sei Agul",
    kabupaten: "Medan",
    kecamatan: "Medan Barat",
    kelurahan: "Sei Agul",
    lat: 3.5965,
    lng: 98.6724,
    luas: 15.5,
    kk: 250,
    status: "sedang",
    tahun: 2023,
    legalitasLahan: "Legal",
    kondisiJalan: "Rusak",
    kondisiDrainase: "Kurang",
    aksesAirMinum: "Terbatas",
  },
  {
    id: "2",
    name: "Kawasan Belawan Bahagia",
    kabupaten: "Medan",
    kecamatan: "Medan Belawan",
    kelurahan: "Belawan Bahagia",
    lat: 3.7772,
    lng: 98.6832,
    luas: 22.3,
    kk: 420,
    status: "berat",
    tahun: 2023,
    legalitasLahan: "Legal",
    kondisiJalan: "Sangat Rusak",
    kondisiDrainase: "Buruk",
    aksesAirMinum: "Sangat Terbatas",
  },
  {
    id: "3",
    name: "Kawasan Teluk Nibung",
    kabupaten: "Medan",
    kecamatan: "Medan Belawan",
    kelurahan: "Teluk Nibung",
    lat: 3.7750,
    lng: 98.6850,
    luas: 18.2,
    kk: 320,
    status: "sedang",
    tahun: 2023,
    legalitasLahan: "Legal",
    kondisiJalan: "Rusak",
    kondisiDrainase: "Kurang",
    aksesAirMinum: "Terbatas",
  },
  {
    id: "4",
    name: "Kawasan Binjai Utara",
    kabupaten: "Binjai",
    kecamatan: "Binjai Utara",
    kelurahan: "Jati Makmur",
    lat: 3.6104,
    lng: 98.4854,
    luas: 12.8,
    kk: 180,
    status: "ringan",
    tahun: 2024,
    legalitasLahan: "Legal",
    kondisiJalan: "Baik",
    kondisiDrainase: "Cukup",
    aksesAirMinum: "Memadai",
  },
  {
    id: "5",
    name: "Kawasan Siantar Selatan",
    kabupaten: "Pematang Siantar",
    kecamatan: "Siantar Selatan",
    kelurahan: "Sudirejo",
    lat: 2.9500,
    lng: 99.0600,
    luas: 20.5,
    kk: 380,
    status: "berat",
    tahun: 2023,
    legalitasLahan: "Tidak Legal",
    kondisiJalan: "Sangat Rusak",
    kondisiDrainase: "Buruk",
    aksesAirMinum: "Sangat Terbatas",
  },
  {
    id: "6",
    name: "Kawasan Tebing Tinggi Kota",
    kabupaten: "Tebing Tinggi",
    kecamatan: "Tebing Tinggi Kota",
    kelurahan: "Pasar Tebing Tinggi",
    lat: 3.3281,
    lng: 99.1628,
    luas: 14.3,
    kk: 270,
    status: "sedang",
    tahun: 2024,
    legalitasLahan: "Legal",
    kondisiJalan: "Rusak",
    kondisiDrainase: "Kurang",
    aksesAirMinum: "Terbatas",
  },
  {
    id: "7",
    name: "Kawasan Sibolga Kota",
    kabupaten: "Sibolga",
    kecamatan: "Sibolga Kota",
    kelurahan: "Pasar Sibolga",
    lat: 1.7409,
    lng: 98.7789,
    luas: 16.7,
    kk: 310,
    status: "sedang",
    tahun: 2023,
    legalitasLahan: "Legal",
    kondisiJalan: "Rusak",
    kondisiDrainase: "Kurang",
    aksesAirMinum: "Terbatas",
  },
  {
    id: "8",
    name: "Kawasan Tanjung Balai Utara",
    kabupaten: "Tanjung Balai",
    kecamatan: "Tanjung Balai Utara",
    kelurahan: "Pantai Burung",
    lat: 2.9667,
    lng: 99.7972,
    luas: 19.4,
    kk: 350,
    status: "berat",
    tahun: 2023,
    legalitasLahan: "Tidak Legal",
    kondisiJalan: "Sangat Rusak",
    kondisiDrainase: "Buruk",
    aksesAirMinum: "Sangat Terbatas",
  },
  {
    id: "9",
    name: "Kawasan Padang Sidempuan Selatan",
    kabupaten: "Padang Sidempuan",
    kecamatan: "Padangsidimpuan Selatan",
    kelurahan: "Wek IV",
    lat: 1.3700,
    lng: 99.2700,
    luas: 13.2,
    kk: 240,
    status: "ringan",
    tahun: 2024,
    legalitasLahan: "Legal",
    kondisiJalan: "Baik",
    kondisiDrainase: "Cukup",
    aksesAirMinum: "Memadai",
  },
  {
    id: "10",
    name: "Kawasan Deli Serdang Timur",
    kabupaten: "Deli Serdang",
    kecamatan: "Lubuk Pakam",
    kelurahan: "Tanjung Morawa",
    lat: 3.4900,
    lng: 98.8800,
    luas: 17.6,
    kk: 330,
    status: "sedang",
    tahun: 2023,
    legalitasLahan: "Legal",
    kondisiJalan: "Rusak",
    kondisiDrainase: "Kurang",
    aksesAirMinum: "Terbatas",
  },
  {
    id: "11",
    name: "Kawasan Serdang Bedagai",
    kabupaten: "Serdang Bedagai",
    kecamatan: "Sei Rampah",
    kelurahan: "Sei Rampah",
    lat: 3.4500,
    lng: 99.1500,
    luas: 21.3,
    kk: 410,
    status: "berat",
    tahun: 2023,
    legalitasLahan: "Tidak Legal",
    kondisiJalan: "Sangat Rusak",
    kondisiDrainase: "Buruk",
    aksesAirMinum: "Sangat Terbatas",
  },
  {
    id: "12",
    name: "Kawasan Langkat Tengah",
    kabupaten: "Langkat",
    kecamatan: "Stabat",
    kelurahan: "Kwala Begumit",
    lat: 3.7600,
    lng: 98.4300,
    luas: 15.8,
    kk: 290,
    status: "sedang",
    tahun: 2024,
    legalitasLahan: "Legal",
    kondisiJalan: "Rusak",
    kondisiDrainase: "Kurang",
    aksesAirMinum: "Terbatas",
  },
  // ============================================
  // TESTING DATA: 2 koordinat berjauhan di Deli Serdang
  // untuk verifikasi fitBounds behavior
  // ============================================
  {
    id: "test-deliserdang-utara",
    name: "[TEST] Kawasan Lubuk Pakam Utara",
    kabupaten: "Deli Serdang",
    kecamatan: "Lubuk Pakam",
    kelurahan: "Lubuk Pakam I",
    lat: 3.5500, // Deli Serdang bagian utara
    lng: 98.8700,
    luas: 11.5,
    kk: 175,
    status: "sedang",
    tahun: 2024,
    legalitasLahan: "Legal",
    kondisiJalan: "Rusak",
    kondisiDrainase: "Kurang",
    aksesAirMinum: "Terbatas",
  },
  {
    id: "test-deliserdang-selatan",
    name: "[TEST] Kawasan Beringin Selatan",
    kabupaten: "Deli Serdang",
    kecamatan: "Beringin",
    kelurahan: "Beringin",
    lat: 3.4200, // Deli Serdang bagian selatan (berjauhan ~14-15 km)
    lng: 98.8200,
    luas: 13.0,
    kk: 220,
    status: "ringan",
    tahun: 2024,
    legalitasLahan: "Legal",
    kondisiJalan: "Baik",
    kondisiDrainase: "Cukup",
    aksesAirMinum: "Memadai",
  },
];

export const kawasanRegionCenters: Record<string, RegionCenter> = {
  medan: { lat: 3.5952, lng: 98.6722, zoom: 11, name: "Kota Medan" },
  "sumatera-utara": {
    lat: 3.3,
    lng: 99.0,
    zoom: 10,
    name: "Sumatera Utara",
  },
};

export const kawasanStatusColors: Record<string, { fill: string; label: string }> = {
  berat: { fill: "#dc2626", label: "Kumuh Berat" },
  sedang: { fill: "#f59e0b", label: "Kumuh Sedang" },
  ringan: { fill: "#22c55e", label: "Kumuh Ringan" },
};
