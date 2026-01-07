/**
 * Penerimaan BSPS Data
 * Data untuk halaman Penerimaan BSPS
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
  jumlahPenerima: number;
  coordinates: [number, number];
  status: "selesai" | "proses" | "rencana";
  penerimaList: PenerimaBsps[];
}

export const desaPenerimaanData: DesaPenerimaan[] = [
  {
    id: 1,
    nama: "Tanjung Rejo",
    kelurahan: "Tanjung Rejo",
    kecamatan: "Percut Sei Tuan",
    kabupaten: "Deli Serdang",
    jumlahPenerima: 25,
    coordinates: [3.6123, 98.7456],
    status: "selesai",
    penerimaList: [
      {
        nama: "Ahmad Sulaiman",
        alamat: "Dusun I",
        coordinates: [3.612, 98.745],
      },
      { nama: "Siti Aminah", alamat: "Dusun II", coordinates: [3.6125, 98.7458] },
      { nama: "Budi Santoso", alamat: "Dusun III", coordinates: [3.6128, 98.7462] },
    ],
  },
  {
    id: 2,
    nama: "Medan Krio",
    kelurahan: "Medan Krio",
    kecamatan: "Sunggal",
    kabupaten: "Deli Serdang",
    jumlahPenerima: 18,
    coordinates: [3.5789, 98.6234],
    status: "proses",
    penerimaList: [
      { nama: "Dewi Lestari", alamat: "Dusun I", coordinates: [3.5785, 98.623] },
      { nama: "Eko Prasetyo", alamat: "Dusun II", coordinates: [3.5792, 98.6238] },
    ],
  },
  {
    id: 3,
    nama: "Bandar Khalipah",
    kelurahan: "Bandar Khalipah",
    kecamatan: "Percut Sei Tuan",
    kabupaten: "Deli Serdang",
    jumlahPenerima: 32,
    coordinates: [3.6345, 98.7789],
    status: "selesai",
    penerimaList: [
      {
        nama: "Rahmat Hidayat",
        alamat: "Dusun I",
        coordinates: [3.634, 98.7785],
      },
      { nama: "Nurul Aini", alamat: "Dusun II", coordinates: [3.6348, 98.7792] },
    ],
  },
  {
    id: 4,
    nama: "Padang Bulan",
    kelurahan: "Padang Bulan",
    kecamatan: "Medan Baru",
    kabupaten: "Kota Medan",
    jumlahPenerima: 15,
    coordinates: [3.5678, 98.6543],
    status: "rencana",
    penerimaList: [
      {
        nama: "Joko Widodo",
        alamat: "Lingkungan I",
        coordinates: [3.5675, 98.654],
      },
    ],
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
