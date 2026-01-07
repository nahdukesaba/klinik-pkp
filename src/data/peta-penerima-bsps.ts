/**
 * Peta Data - Penerima BSPS
 * Data untuk halaman Peta Penerima BSPS
 */

export interface DesaPenerimaBsps {
  id: number;
  nama: string;
  kecamatan: string;
  kabupaten: string;
  jumlahPenerima: number;
  status: "selesai" | "proses" | "rencana";
  tahun: number;
  coordinates: [number, number][];
  centerLat: number;
  centerLng: number;
}

export const desaPenerimaBspsData: DesaPenerimaBsps[] = [
  {
    id: 1,
    nama: "Desa Tanjung Rejo",
    kecamatan: "Kec. Percut Sei Tuan",
    kabupaten: "Kab. Deli Serdang",
    jumlahPenerima: 45,
    status: "selesai",
    tahun: 2023,
    coordinates: [
      [3.7752, 98.6879],
      [3.7802, 98.6879],
      [3.7802, 98.6929],
      [3.7752, 98.6929],
    ],
    centerLat: 3.7777,
    centerLng: 98.6904,
  },
  {
    id: 2,
    nama: "Desa Medan Krio",
    kecamatan: "Kec. Sunggal",
    kabupaten: "Kab. Deli Serdang",
    jumlahPenerima: 32,
    status: "selesai",
    tahun: 2023,
    coordinates: [
      [3.5952, 98.6122],
      [3.6002, 98.6122],
      [3.6002, 98.6172],
      [3.5952, 98.6172],
    ],
    centerLat: 3.5977,
    centerLng: 98.6147,
  },
  {
    id: 3,
    nama: "Desa Bandar Khalipah",
    kecamatan: "Kec. Percut Sei Tuan",
    kabupaten: "Kab. Deli Serdang",
    jumlahPenerima: 28,
    status: "proses",
    tahun: 2024,
    coordinates: [
      [3.6852, 98.7179],
      [3.6902, 98.7179],
      [3.6902, 98.7229],
      [3.6852, 98.7229],
    ],
    centerLat: 3.6877,
    centerLng: 98.7204,
  },
  {
    id: 4,
    nama: "Desa Helvetia",
    kecamatan: "Kec. Labuhan Deli",
    kabupaten: "Kab. Deli Serdang",
    jumlahPenerima: 56,
    status: "selesai",
    tahun: 2022,
    coordinates: [
      [3.6152, 98.6379],
      [3.6202, 98.6379],
      [3.6202, 98.6429],
      [3.6152, 98.6429],
    ],
    centerLat: 3.6177,
    centerLng: 98.6404,
  },
  {
    id: 5,
    nama: "Desa Padang Bulan",
    kecamatan: "Kec. Medan Baru",
    kabupaten: "Kota Medan",
    jumlahPenerima: 38,
    status: "proses",
    tahun: 2024,
    coordinates: [
      [3.5652, 98.6522],
      [3.5702, 98.6522],
      [3.5702, 98.6572],
      [3.5652, 98.6572],
    ],
    centerLat: 3.5677,
    centerLng: 98.6547,
  },
  {
    id: 6,
    nama: "Desa Sei Sikambing",
    kecamatan: "Kec. Medan Sunggal",
    kabupaten: "Kota Medan",
    jumlahPenerima: 42,
    status: "selesai",
    tahun: 2023,
    coordinates: [
      [3.5752, 98.6322],
      [3.5802, 98.6322],
      [3.5802, 98.6372],
      [3.5752, 98.6372],
    ],
    centerLat: 3.5777,
    centerLng: 98.6347,
  },
  {
    id: 7,
    nama: "Desa Tanjung Morawa",
    kecamatan: "Kec. Tanjung Morawa",
    kabupaten: "Kab. Deli Serdang",
    jumlahPenerima: 67,
    status: "selesai",
    tahun: 2022,
    coordinates: [
      [3.5452, 98.7779],
      [3.5502, 98.7779],
      [3.5502, 98.7829],
      [3.5452, 98.7829],
    ],
    centerLat: 3.5477,
    centerLng: 98.7804,
  },
  {
    id: 8,
    nama: "Desa Binjai Kota",
    kecamatan: "Kec. Binjai Kota",
    kabupaten: "Kota Binjai",
    jumlahPenerima: 51,
    status: "rencana",
    tahun: 2025,
    coordinates: [
      [3.6052, 98.4879],
      [3.6102, 98.4879],
      [3.6102, 98.4929],
      [3.6052, 98.4929],
    ],
    centerLat: 3.6077,
    centerLng: 98.4904,
  },
  {
    id: 9,
    nama: "Desa Percut",
    kecamatan: "Kec. Percut Sei Tuan",
    kabupaten: "Kab. Deli Serdang",
    jumlahPenerima: 73,
    status: "selesai",
    tahun: 2023,
    coordinates: [
      [3.7052, 98.7579],
      [3.7102, 98.7579],
      [3.7102, 98.7629],
      [3.7052, 98.7629],
    ],
    centerLat: 3.7077,
    centerLng: 98.7604,
  },
  {
    id: 10,
    nama: "Desa Belawan",
    kecamatan: "Kec. Medan Belawan",
    kabupaten: "Kota Medan",
    jumlahPenerima: 84,
    status: "selesai",
    tahun: 2022,
    coordinates: [
      [3.7652, 98.6879],
      [3.7702, 98.6879],
      [3.7702, 98.6929],
      [3.7652, 98.6929],
    ],
    centerLat: 3.7677,
    centerLng: 98.6904,
  },
];

export const bspsStatusColors: Record<string, { fill: string; stroke: string; label: string }> = {
  selesai: { fill: "#22c55e", stroke: "#16a34a", label: "Selesai" },
  proses: { fill: "#eab308", stroke: "#ca8a04", label: "Dalam Proses" },
  rencana: { fill: "#3b82f6", stroke: "#2563eb", label: "Rencana" },
};
