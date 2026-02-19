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
  lingkungan: string[];
  lat: number;
  lng: number;
  luas: number;
  penduduk: number;
  status: "berat" | "sedang" | "ringan";
  tahun: number;
  legalitasLahan: "Legal" | "Tidak Legal";
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
    lingkungan: ["Dusun Bakau", "Beringin", "Cemara", "Kenari", "Kenanga"],
    lat: 3.5965,
    lng: 98.6724,
    luas: 15.5,
    penduduk: 1025,
    status: "sedang",
    tahun: 2023,
    legalitasLahan: "Legal",
  },
  {
    id: "2",
    name: "Kawasan Belawan Bahagia",
    kabupaten: "Medan",
    kecamatan: "Medan Belawan",
    kelurahan: "Belawan Bahagia",
    lingkungan: ["Dusun Nelayan", "Pesisir", "Muara", "Harapan"],
    lat: 3.7772,
    lng: 98.6832,
    luas: 22.3,
    penduduk: 1764,
    status: "berat",
    tahun: 2023,
    legalitasLahan: "Legal",
  },
  {
    id: "3",
    name: "Kawasan Teluk Nibung",
    kabupaten: "Medan",
    kecamatan: "Medan Belawan",
    kelurahan: "Teluk Nibung",
    lingkungan: ["Dusun Laut", "Pantai", "Karang"],
    lat: 3.7750,
    lng: 98.6850,
    luas: 18.2,
    penduduk: 1312,
    status: "sedang",
    tahun: 2023,
    legalitasLahan: "Legal",
  },
  {
    id: "4",
    name: "Kawasan Binjai Utara",
    kabupaten: "Binjai",
    kecamatan: "Binjai Utara",
    kelurahan: "Jati Makmur",
    lingkungan: ["Dusun Jati", "Makmur", "Sejahtera"],
    lat: 3.6104,
    lng: 98.4854,
    luas: 12.8,
    penduduk: 756,
    status: "ringan",
    tahun: 2024,
    legalitasLahan: "Legal",
  },
  {
    id: "5",
    name: "Kawasan Siantar Selatan",
    kabupaten: "Pematang Siantar",
    kecamatan: "Siantar Selatan",
    kelurahan: "Sudirejo",
    lingkungan: ["Dusun Melati", "Anggrek", "Dahlia", "Mawar"],
    lat: 2.9500,
    lng: 99.0600,
    luas: 20.5,
    penduduk: 1558,
    status: "berat",
    tahun: 2023,
    legalitasLahan: "Tidak Legal",
  },
  {
    id: "6",
    name: "Kawasan Tebing Tinggi Kota",
    kabupaten: "Tebing Tinggi",
    kecamatan: "Tebing Tinggi Kota",
    kelurahan: "Pasar Tebing Tinggi",
    lingkungan: ["Dusun Pasar", "Tengah", "Baru"],
    lat: 3.3281,
    lng: 99.1628,
    luas: 14.3,
    penduduk: 1107,
    status: "sedang",
    tahun: 2024,
    legalitasLahan: "Legal",
  },
  {
    id: "7",
    name: "Kawasan Sibolga Kota",
    kabupaten: "Sibolga",
    kecamatan: "Sibolga Kota",
    kelurahan: "Pasar Sibolga",
    lingkungan: ["Dusun Dermaga", "Pelabuhan", "Bahari"],
    lat: 1.7409,
    lng: 98.7789,
    luas: 16.7,
    penduduk: 1271,
    status: "sedang",
    tahun: 2023,
    legalitasLahan: "Legal",
  },
  {
    id: "8",
    name: "Kawasan Tanjung Balai Utara",
    kabupaten: "Tanjung Balai",
    kecamatan: "Tanjung Balai Utara",
    kelurahan: "Pantai Burung",
    lingkungan: ["Dusun Pantai", "Burung", "Laut", "Ombak"],
    lat: 2.9667,
    lng: 99.7972,
    luas: 19.4,
    penduduk: 1435,
    status: "berat",
    tahun: 2023,
    legalitasLahan: "Tidak Legal",
  },
  {
    id: "9",
    name: "Kawasan Padang Sidempuan Selatan",
    kabupaten: "Padang Sidempuan",
    kecamatan: "Padangsidimpuan Selatan",
    kelurahan: "Wek IV",
    lingkungan: ["Dusun Aek Tampang", "Silandit", "Padang Matinggi"],
    lat: 1.3700,
    lng: 99.2700,
    luas: 13.2,
    penduduk: 984,
    status: "ringan",
    tahun: 2024,
    legalitasLahan: "Legal",
  },
  {
    id: "10",
    name: "Kawasan Deli Serdang Timur",
    kabupaten: "Deli Serdang",
    kecamatan: "Lubuk Pakam",
    kelurahan: "Tanjung Morawa",
    lingkungan: ["Dusun Tanjung", "Morawa", "Sumber Rejo"],
    lat: 3.4900,
    lng: 98.8800,
    luas: 17.6,
    penduduk: 1353,
    status: "sedang",
    tahun: 2023,
    legalitasLahan: "Legal",
  },
  {
    id: "11",
    name: "Kawasan Serdang Bedagai",
    kabupaten: "Serdang Bedagai",
    kecamatan: "Sei Rampah",
    kelurahan: "Sei Rampah",
    lingkungan: ["Dusun Sei", "Rampah", "Tegal", "Perbaungan"],
    lat: 3.4500,
    lng: 99.1500,
    luas: 21.3,
    penduduk: 1681,
    status: "berat",
    tahun: 2023,
    legalitasLahan: "Tidak Legal",
  },
  {
    id: "12",
    name: "Kawasan Langkat Tengah",
    kabupaten: "Langkat",
    kecamatan: "Stabat",
    kelurahan: "Kwala Begumit",
    lingkungan: ["Dusun Kwala", "Begumit", "Stabat Lama"],
    lat: 3.7600,
    lng: 98.4300,
    luas: 15.8,
    penduduk: 1189,
    status: "sedang",
    tahun: 2024,
    legalitasLahan: "Legal",
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
