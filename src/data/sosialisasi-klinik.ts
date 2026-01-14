/**
 * Sosialisasi Klinik PKP Data
 * Data untuk halaman Sosialisasi Klinik PKP
 */

export interface SosialisasiEvent {
  id: number;
  name: string;
  kabupaten: string;
  kecamatan?: string;
  kelurahan?: string;
  coordinates: [number, number];
  date: string;
  time: string; // Format: "09:00 - 12:00"
  peserta: number;
  alamat: string;
  status: "selesai" | "mendatang";
  images: string[];
}

export interface BeritaSosialisasi {
  id: number;
  title: string;
  image: string;
  date: string;
  rawDate: string;
  month: string;
  description: string;
  kabupaten: string;
  coordinates: [number, number];
  images?: string[]; // Additional images for carousel
}

export const kabupatenList: string[] = [
  "Semua Lokasi",
  "Deli Serdang",
  "Kota Medan",
  "Langkat",
  "Serdang Bedagai",
  "Binjai",
  "Tebing Tinggi",
  "Pematang Siantar",
];

export const sosialisasiLocations: SosialisasiEvent[] = [
  {
    id: 1,
    name: "Sosialisasi BSPS Deli Serdang",
    kabupaten: "Deli Serdang",
    kecamatan: "Percut Sei Tuan",
    kelurahan: "Bandar Klippa",
    coordinates: [3.4012, 98.9458],
    date: "2024-01-15",
    time: "09:00 - 12:00",
    peserta: 150,
    alamat: "Aula Kecamatan Percut Sei Tuan",
    status: "selesai",
    images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop",
    ],
  },
  {
    id: 2,
    name: "Sosialisasi BSPS Kota Medan",
    kabupaten: "Kota Medan",
    kecamatan: "Medan Kota",
    kelurahan: "Kota Matsum I",
    coordinates: [3.5952, 98.6722],
    date: "2024-01-22",
    time: "08:30 - 11:30",
    peserta: 200,
    alamat: "Gedung Serbaguna Medan",
    status: "selesai",
    images: [
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1559223607-180d0c16c333?w=400&h=300&fit=crop",
    ],
  },
  {
    id: 3,
    name: "Sosialisasi BSPS Langkat",
    kabupaten: "Langkat",
    kecamatan: "Stabat",
    kelurahan: "Stabat Lama",
    coordinates: [3.7688, 98.2738],
    date: "2024-02-05",
    time: "09:00 - 12:00",
    peserta: 120,
    alamat: "Balai Desa Stabat",
    status: "selesai",
    images: [
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560439514-4e9645039924?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
    ],
  },
  {
    id: 4,
    name: "Sosialisasi BSPS Serdang Bedagai",
    kabupaten: "Serdang Bedagai",
    kecamatan: "Sei Rampah",
    kelurahan: "Sei Rampah",
    coordinates: [3.2678, 99.0158],
    date: "2024-02-12",
    time: "10:00 - 13:00",
    peserta: 100,
    alamat: "Kantor Camat Sei Rampah",
    status: "selesai",
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop",
    ],
  },
  {
    id: 5,
    name: "Sosialisasi BSPS Binjai",
    kabupaten: "Binjai",
    kecamatan: "Binjai Kota",
    kelurahan: "Satria",
    coordinates: [3.6001, 98.4854],
    date: "2024-02-20",
    time: "09:00 - 11:00",
    peserta: 80,
    alamat: "Aula Kota Binjai",
    status: "selesai",
    images: [
      "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1559223606-f8bb1e8a1f23?w=400&h=300&fit=crop",
    ],
  },
  {
    id: 6,
    name: "Sosialisasi BSPS Tebing Tinggi",
    kabupaten: "Tebing Tinggi",
    kecamatan: "Tebing Tinggi Kota",
    kelurahan: "Pasar Baru",
    coordinates: [3.3289, 99.1625],
    date: "2024-12-25",
    time: "09:00 - 12:00",
    peserta: 0,
    alamat: "Gedung Balai Kota Tebing Tinggi",
    status: "mendatang",
    images: [],
  },
  {
    id: 7,
    name: "Sosialisasi BSPS Pematang Siantar",
    kabupaten: "Pematang Siantar",
    kecamatan: "Siantar Barat",
    kelurahan: "Proklamasi",
    coordinates: [2.9595, 99.0687],
    date: "2025-01-10",
    time: "08:00 - 11:00",
    peserta: 0,
    alamat: "Aula Pemerintah Kota",
    status: "mendatang",
    images: [],
  },
  {
    id: 8,
    name: "Sosialisasi BSPS Kota Medan II",
    kabupaten: "Kota Medan",
    kecamatan: "Medan Baru",
    coordinates: [3.5652, 98.7022],
    date: "2025-02-15",
    time: "09:30 - 12:30",
    peserta: 0,
    alamat: "Balai Kota Medan",
    status: "mendatang",
    images: [],
  },
  {
    id: 9,
    name: "Sosialisasi BSPS Langkat II",
    kabupaten: "Langkat",
    kecamatan: "Binjai",
    coordinates: [3.7988, 98.2438],
    date: "2025-03-20",
    time: "10:00 - 13:00",
    peserta: 0,
    alamat: "Gedung Serbaguna Langkat",
    status: "mendatang",
    images: [],
  },
  {
    id: 10,
    name: "Sosialisasi BSPS Deli Serdang II",
    kabupaten: "Deli Serdang",
    kecamatan: "Lubuk Pakam",
    kelurahan: "Lubuk Pakam Pekan",
    coordinates: [3.5478, 98.8578],
    date: "2025-04-05",
    time: "09:00 - 12:00",
    peserta: 0,
    alamat: "Kantor Bupati Deli Serdang",
    status: "mendatang",
    images: [],
  },
  {
    id: 11,
    name: "Sosialisasi BSPS Binjai II",
    kabupaten: "Binjai",
    kecamatan: "Binjai Utara",
    kelurahan: "Jati Makmur",
    coordinates: [3.6201, 98.4654],
    date: "2025-04-15",
    time: "08:30 - 11:30",
    peserta: 0,
    alamat: "Balai Kelurahan Jati Makmur",
    status: "mendatang",
    images: [],
  },
  {
    id: 12,
    name: "Sosialisasi BSPS Serdang Bedagai II",
    kabupaten: "Serdang Bedagai",
    kecamatan: "Perbaungan",
    kelurahan: "Citaman",
    coordinates: [3.5478, 98.9578],
    date: "2025-05-10",
    time: "09:00 - 12:00",
    peserta: 0,
    alamat: "Aula Kecamatan Perbaungan",
    status: "mendatang",
    images: [],
  },
  {
    id: 13,
    name: "Sosialisasi BSPS Kota Medan III",
    kabupaten: "Kota Medan",
    kecamatan: "Medan Tembung",
    kelurahan: "Sidorejo",
    coordinates: [3.5852, 98.7122],
    date: "2025-05-25",
    time: "10:00 - 13:00",
    peserta: 0,
    alamat: "Kantor Kecamatan Medan Tembung",
    status: "mendatang",
    images: [],
  },
  {
    id: 14,
    name: "Sosialisasi BSPS Tebing Tinggi II",
    kabupaten: "Tebing Tinggi",
    kecamatan: "Rambutan",
    kelurahan: "Rambutan",
    coordinates: [3.3489, 99.1425],
    date: "2025-06-08",
    time: "09:00 - 11:30",
    peserta: 0,
    alamat: "Gedung Balai Desa Rambutan",
    status: "mendatang",
    images: [],
  },
  {
    id: 15,
    name: "Sosialisasi BSPS Pematang Siantar II",
    kabupaten: "Pematang Siantar",
    kecamatan: "Siantar Timur",
    kelurahan: "Pardomuan",
    coordinates: [2.9695, 99.0787],
    date: "2025-06-20",
    time: "08:00 - 11:00",
    peserta: 0,
    alamat: "Aula Kelurahan Pardomuan",
    status: "mendatang",
    images: [],
  },
];

export const beritaSosialisasiList: BeritaSosialisasi[] = [
  {
    id: 1,
    title: "Sosialisasi Program BSPS di Kota Medan",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    date: "15 Januari 2025",
    rawDate: "2025-01-15",
    month: "2025-01",
    description:
      "Tim Klinik PKP BP3KP Sumatera II mengadakan sosialisasi program Bantuan Stimulan Perumahan Swadaya (BSPS) di Kota Medan.",
    kabupaten: "Kota Medan",
    coordinates: [3.5952, 98.6722],
    images: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
    ],
  },
  {
    id: 2,
    title: "Workshop Teknis Pembangunan Rumah Layak Huni",
    image:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop",
    date: "22 Januari 2025",
    rawDate: "2025-01-22",
    month: "2025-01",
    description:
      "Workshop teknis tentang standar pembangunan rumah layak huni sesuai dengan ketentuan yang berlaku bagi masyarakat penerima bantuan.",
    kabupaten: "Deli Serdang",
    coordinates: [3.4012, 98.9458],
    images: [
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559223607-180d0c16c333?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=600&fit=crop",
    ],
  },
  {
    id: 3,
    title: "Edukasi Perizinan Bangunan untuk Masyarakat",
    image:
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&h=400&fit=crop",
    date: "5 Februari 2025",
    rawDate: "2025-02-05",
    month: "2025-02",
    description:
      "Kegiatan edukasi mengenai prosedur dan persyaratan perizinan bangunan bagi masyarakat yang akan membangun atau merenovasi rumah.",
    kabupaten: "Langkat",
    coordinates: [3.7688, 98.2738],
    images: [
      "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop",
    ],
  },
  {
    id: 4,
    title: "Pelatihan Kelompok Swadaya Masyarakat",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    date: "12 Februari 2025",
    rawDate: "2025-02-12",
    month: "2025-02",
    description:
      "Pelatihan untuk meningkatkan kapasitas Kelompok Swadaya Masyarakat dalam pengelolaan dan pengawasan pembangunan rumah.",
    kabupaten: "Serdang Bedagai",
    coordinates: [3.2678, 99.0158],
    images: [
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
    ],
  },
  {
    id: 5,
    title: "Seminar Perumahan Berkelanjutan",
    image:
      "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=600&h=400&fit=crop",
    date: "20 Februari 2025",
    rawDate: "2025-02-20",
    month: "2025-02",
    description:
      "Seminar tentang konsep perumahan berkelanjutan dan ramah lingkungan untuk masa depan yang lebih baik.",
    kabupaten: "Binjai",
    coordinates: [3.6001, 98.4854],
    images: [
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559223606-f8bb1e8a1f23?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    ],
  },
  {
    id: 6,
    title: "Sosialisasi Program KOTAKU",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop",
    date: "1 Maret 2025",
    rawDate: "2025-03-01",
    month: "2025-03",
    description:
      "Sosialisasi program Kota Tanpa Kumuh (KOTAKU) untuk penanganan kawasan permukiman kumuh di perkotaan.",
    kabupaten: "Tebing Tinggi",
    coordinates: [3.3289, 99.1625],
    images: [
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop",
    ],
  },
];

export const sosialisasiStatusColors = {
  selesai: { fill: "#22c55e", label: "Selesai" },
  mendatang: { fill: "#3b82f6", label: "Mendatang" },
};
