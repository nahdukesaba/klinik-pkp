/**
 * Penerimaan BSPS Data
 * Data untuk halaman Penerimaan BSPS
 * 
 * Data real penerima BSPS di wilayah Sumatera Utara
 */

export interface PenerimaBsps {
  nama: string;
  alamat: string;
  coordinates: [number, number];
}

export interface DesaPenerimaan {
  id: number;
  nama: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  alokasiUnit: number;
  coordinates: [number, number];
  status: "selesai" | "proses" | "rencana";
  penerimaList: PenerimaBsps[];
}

// Data real penerima BSPS (updated from peta-penerima-bsps)
export const desaPenerimaanData: DesaPenerimaan[] = [
  // ==================== TAPANULI SELATAN ====================
  {
    id: 1,
    nama: "Tanjung Dolok",
    kelurahan: "Tanjung Dolok",
    kecamatan: "Marancar",
    kabupaten: "Kab. Tapanuli Selatan",
    alokasiUnit: 10,
    coordinates: [1.5167050403142495, 99.16664798620452],
    status: "selesai",
    penerimaList: [],
  },
  {
    id: 2,
    nama: "Simaninggir",
    kelurahan: "Simaninggir",
    kecamatan: "Marancar",
    kabupaten: "Kab. Tapanuli Selatan",
    alokasiUnit: 10,
    coordinates: [1.5978317515969158, 99.28030584647558],
    status: "selesai",
    penerimaList: [],
  },
  {
    id: 3,
    nama: "Huraba",
    kelurahan: "Huraba",
    kecamatan: "Marancar",
    kabupaten: "Kab. Tapanuli Selatan",
    alokasiUnit: 10,
    coordinates: [1.4902693569964154, 99.11895553532365],
    status: "proses",
    penerimaList: [],
  },
  {
    id: 4,
    nama: "Marancar Hulu",
    kelurahan: "Marancar Hulu",
    kecamatan: "Marancar",
    kabupaten: "Kab. Tapanuli Selatan",
    alokasiUnit: 10,
    coordinates: [1.5255969098295838, 99.15822610555627],
    status: "proses",
    penerimaList: [],
  },
  {
    id: 5,
    nama: "Paran Padang",
    kelurahan: "Paran Padang",
    kecamatan: "Sipirok",
    kabupaten: "Kab. Tapanuli Selatan",
    alokasiUnit: 10,
    coordinates: [1.6041056779107654, 99.29363660710722],
    status: "rencana",
    penerimaList: [],
  },
  // ==================== KOTA PADANGSIDIMPUAN ====================
  {
    id: 6,
    nama: "Simasom",
    kelurahan: "Simasom",
    kecamatan: "Padangsidimpuan Angkola Julu",
    kabupaten: "Kota Padangsidimpuan",
    alokasiUnit: 11,
    coordinates: [1.4625567281827179, 99.26335369960111],
    status: "selesai",
    penerimaList: [],
  },
  {
    id: 7,
    nama: "Ujunggurap",
    kelurahan: "Ujunggurap",
    kecamatan: "Padangsidimpuan Batunadua",
    kabupaten: "Kota Padangsidimpuan",
    alokasiUnit: 18,
    coordinates: [1.4017035050080835, 99.3005129541393],
    status: "selesai",
    penerimaList: [],
  },
  // ==================== LANGKAT ====================
  {
    id: 8,
    nama: "Pekan Sawah",
    kelurahan: "Pekan Sawah",
    kecamatan: "Sei Bingai",
    kabupaten: "Kab. Langkat",
    alokasiUnit: 10,
    coordinates: [3.425691414768961, 98.4919237164834],
    status: "selesai",
    penerimaList: [],
  },
  {
    id: 9,
    nama: "Tanjung Gunung",
    kelurahan: "Tanjung Gunung",
    kecamatan: "Sei Bingai",
    kabupaten: "Kab. Langkat",
    alokasiUnit: 10,
    coordinates: [3.365480772955799, 98.48768066878638],
    status: "proses",
    penerimaList: [],
  },
  {
    id: 10,
    nama: "Simpang Kuta Buluh",
    kelurahan: "Simpang Kuta Buluh",
    kecamatan: "Sei Bingai",
    kabupaten: "Kab. Langkat",
    alokasiUnit: 10,
    coordinates: [3.424260749288357, 98.43379243913056],
    status: "proses",
    penerimaList: [],
  },
  {
    id: 11,
    nama: "Suka Rakyat",
    kelurahan: "Suka Rakyat",
    kecamatan: "Bahorok",
    kabupaten: "Kab. Langkat",
    alokasiUnit: 10,
    coordinates: [3.542959838597214, 98.22579160226147],
    status: "rencana",
    penerimaList: [],
  },
];

export const penerimaanStatusColors: Record<string, { fill: string; stroke: string }> = {
  selesai: { fill: "#22c55e", stroke: "#16a34a" },
  proses: { fill: "#eab308", stroke: "#ca8a04" },
  rencana: { fill: "#3b82f6", stroke: "#2563eb" },
};

export const penerimaanStatusLabels: Record<string, string> = {
  selesai: "Selesai",
  proses: "Dalam Proses",
  rencana: "Rencana",
};

export const bspsRequirements: string[] = [
  "Warga Negara Indonesia (WNI)",
  "Sudah berkeluarga atau berusia minimal 21 tahun",
  "Memiliki atau menguasai tanah dengan bukti kepemilikan",
  "Belum pernah menerima bantuan perumahan dari pemerintah",
  "Berpenghasilan rendah (sesuai ketentuan yang berlaku)",
  "Rumah tidak layak huni atau belum memiliki rumah",
];

export interface BspsProcessStep {
  step: number;
  title: string;
  description: string;
}

export const bspsProcessSteps: BspsProcessStep[] = [
  {
    step: 1,
    title: "Pendaftaran",
    description: "Mengisi formulir pendaftaran di kantor desa atau kelurahan",
  },
  {
    step: 2,
    title: "Verifikasi",
    description: "Tim melakukan verifikasi data dan survei lapangan",
  },
  {
    step: 3,
    title: "Seleksi",
    description: "Penetapan calon penerima berdasarkan kriteria",
  },
  {
    step: 4,
    title: "Pencairan",
    description: "Bantuan disalurkan secara bertahap sesuai progres",
  },
  {
    step: 5,
    title: "Pembangunan",
    description: "Pelaksanaan pembangunan dengan pendampingan",
  },
  {
    step: 6,
    title: "Serah Terima",
    description: "Verifikasi akhir dan serah terima rumah",
  },
];

// Kriteria Penerima BSPS
export const bspsKriteriaUtama: string[] = [
  "Masyarakat Berpenghasilan Rendah (MBR)",
  "Memiliki rumah tidak layak huni",
  "Terdaftar dalam Data Terpadu Kesejahteraan Sosial (DTKS)",
];

export const bspsPrioritasPenerima: string[] = [
  "Lansia, janda, dan penyandang disabilitas",
  "Keluarga miskin dengan anak balita",
  "Korban bencana alam",
];
