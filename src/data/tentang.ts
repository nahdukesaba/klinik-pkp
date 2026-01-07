/**
 * Data untuk halaman Tentang
 * Informasi mengenai BP3KP Sumatera II dan Klinik PKP
 */

export interface VisiMisi {
  title: string;
  content: string[];
}

export interface Tugas {
  id: number;
  title: string;
  description: string;
}

export interface Layanan {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export const aboutInfo = {
  title: "Balai Pelaksanaan Perumahan, Permukiman, dan Kawasan Perdesaan (BP3KP) Sumatera II",
  shortTitle: "BP3KP Sumatera II",
  description: "BP3KP Sumatera II merupakan Unit Pelaksana Teknis (UPT) dari Kementerian Pekerjaan Umum dan Perumahan Rakyat yang bertugas melaksanakan kebijakan teknis operasional di bidang perumahan, permukiman, dan kawasan perdesaan di wilayah Sumatera bagian Utara.",
  alamat: {
    jalan: "Jl. Jend. Gatot Subroto No.437",
    kota: "Medan",
    provinsi: "Sumatera Utara",
    kodePos: "20122",
    telp: "(061) 4155222",
    email: "bp3kp.sumateraii@pu.go.id",
  },
  wilayahKerja: [
    "Provinsi Aceh",
    "Provinsi Sumatera Utara",
  ],
};

export const visiMisi: VisiMisi[] = [
  {
    title: "Visi",
    content: [
      "Terwujudnya perumahan dan kawasan permukiman yang layak huni dan produktif dalam lingkungan yang sehat dan aman di wilayah Sumatera bagian Utara."
    ],
  },
  {
    title: "Misi",
    content: [
      "Meningkatkan akses terhadap hunian yang layak dan terjangkau bagi masyarakat",
      "Mengembangkan dan mengelola kawasan permukiman yang berkelanjutan",
      "Meningkatkan kualitas infrastruktur perumahan dan permukiman",
      "Mendorong peran serta masyarakat dalam pembangunan perumahan dan permukiman",
      "Memberikan layanan teknis yang profesional dan responsif kepada masyarakat",
    ],
  },
];

export const tugasPokok: Tugas[] = [
  {
    id: 1,
    title: "Pelaksanaan Program BSPS",
    description: "Melaksanakan program Bantuan Stimulan Perumahan Swadaya (BSPS) untuk membantu masyarakat berpenghasilan rendah dalam membangun dan memperbaiki rumah mereka.",
  },
  {
    id: 2,
    title: "Penanganan Kawasan Kumuh",
    description: "Melaksanakan kegiatan penanganan kawasan kumuh melalui peningkatan infrastruktur dan perbaikan kondisi lingkungan permukiman.",
  },
  {
    id: 3,
    title: "Pembangunan Rusun",
    description: "Mengawasi dan melaksanakan pembangunan rumah susun umum untuk memenuhi kebutuhan hunian vertikal yang layak dan terjangkau.",
  },
  {
    id: 4,
    title: "Fasilitasi dan Konsultasi",
    description: "Memberikan fasilitasi teknis dan konsultasi kepada pemerintah daerah dan masyarakat terkait pembangunan perumahan dan permukiman.",
  },
  {
    id: 5,
    title: "Monitoring dan Evaluasi",
    description: "Melakukan monitoring dan evaluasi terhadap pelaksanaan program-program di bidang perumahan, permukiman, dan kawasan perdesaan.",
  },
  {
    id: 6,
    title: "Peningkatan SDM",
    description: "Melaksanakan kegiatan peningkatan kapasitas sumber daya manusia di bidang perumahan dan permukiman melalui sosialisasi dan pelatihan.",
  },
];

export const layananKlinik: Layanan[] = [
  {
    id: 1,
    icon: "FileQuestion",
    title: "Konsultasi Gratis",
    description: "Layanan konsultasi gratis seputar perumahan, permukiman, dan program bantuan pemerintah.",
  },
  {
    id: 2,
    icon: "ClipboardList",
    title: "Pendampingan BSPS",
    description: "Pendampingan teknis dalam proses pengajuan dan pelaksanaan program BSPS.",
  },
  {
    id: 3,
    icon: "Home",
    title: "Bank Desain",
    description: "Akses ke koleksi desain rumah dan rusun yang sesuai dengan standar dan kebutuhan masyarakat.",
  },
  {
    id: 4,
    icon: "Users",
    title: "Sosialisasi Program",
    description: "Kegiatan sosialisasi dan edukasi mengenai program-program perumahan dan permukiman.",
  },
  {
    id: 5,
    icon: "FileText",
    title: "Informasi Peraturan",
    description: "Informasi lengkap mengenai peraturan dan persyaratan di bidang perumahan dan permukiman.",
  },
  {
    id: 6,
    icon: "MapPin",
    title: "Pemetaan Wilayah",
    description: "Akses data dan pemetaan sebaran rusun, kawasan kumuh, dan penerima program BSPS.",
  },
];

export const sejarah = {
  title: "Sejarah Singkat",
  paragraphs: [
    "Balai Pelaksanaan Perumahan, Permukiman, dan Kawasan Perdesaan (BP3KP) Sumatera II dibentuk sebagai bagian dari upaya pemerintah untuk meningkatkan kualitas perumahan dan permukiman di Indonesia, khususnya di wilayah Sumatera bagian Utara.",
    "Dengan wilayah kerja yang mencakup Provinsi Aceh dan Sumatera Utara, BP3KP Sumatera II memiliki peran strategis dalam mendukung program-program Kementerian PUPR di tingkat daerah.",
    "Klinik PKP (Perumahan dan Kawasan Permukiman) hadir sebagai wujud komitmen BP3KP Sumatera II dalam memberikan layanan yang lebih dekat dan responsif kepada masyarakat, khususnya dalam memberikan informasi, konsultasi, dan pendampingan teknis di bidang perumahan dan permukiman.",
  ],
};

export const nilaiNilai = [
  {
    icon: "Target",
    title: "Profesional",
    description: "Bekerja dengan kompetensi tinggi dan standar kualitas terbaik",
  },
  {
    icon: "Heart",
    title: "Peduli",
    description: "Mengutamakan kepentingan masyarakat dan keberlanjutan lingkungan",
  },
  {
    icon: "Zap",
    title: "Responsif",
    description: "Cepat tanggap dalam memberikan layanan dan solusi kepada masyarakat",
  },
  {
    icon: "Shield",
    title: "Integritas",
    description: "Menjunjung tinggi kejujuran, transparansi, dan akuntabilitas",
  },
];
