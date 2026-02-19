/**
 * Data untuk halaman Tentang
 * Informasi mengenai BP3KP Sumatera II dan Klinik PKP
 */

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
    jalan: "Jalan Suluh No. 99, Kel. Sidorejo Hilir, Kec. Medan Tembung, 20222, Kota Medan, Prov. Sumatera Utara",
    kota: "Medan",
    provinsi: "Sumatera Utara",
    kodePos: "20222",
    telp: "+62 822 4696 0231",
    email: "klinikpkpsumateraii@gmail.com",
    satker: {
      nama: "Satker BP3KP",
      jalan: "Gedung Wijaya Karya Beton (PT Wika Beton), Jl. Gunung Krakatau No.15, Pulo Brayan Darat II, Kec. Medan Tim., Kota Medan, Sumatera Utara 20239"
    }
  },
  wilayahKerja: [
    "Provinsi Sumatera Utara",
  ],
};

export const tugasDanFungsi = {
  tugas: "melaksanakan penyediaan perumahan, peningkatan kualitas perumahan, pengembangan kawasan permukiman, penataan kawasan permukiman pasca bencana dan kerusuhan sosial, dan fasilitasi serah terima aset.",
  fungsi: [
    "penyusunan program dan anggaran pelaksanaan pengembangan kawasan permukiman, pemberian bantuan prasarana, sarana, dan utilitas umum, serta pembangunan dan peningkatan kualitas perumahan;",
    "penyusunan rencana teknis pengembangan kawasan permukiman, pemberian bantuan prasarana, sarana, dan utilitas umum, serta pembangunan dan peningkatan kualitas perumahan;",
    "pelaksanaan pembangunan dan peningkatan kualitas perumahan;",
    "pelaksanaan dan koordinasi pengawasan dan pengendalian teknis pengembangan kawasan permukiman, pemberian bantuan prasarana, sarana, dan utilitas umum, serta pembangunan dan peningkatan kualitas perumahan;",
    "pelaksanaan pemantauan dan evaluasi pembangunan perumahan dan kawasan permukiman;",
    "pengelolaan data dan informasi perumahan dan kawasan permukiman;",
    "pelaksanaan koordinasi dan dukungan penataan kawasan permukiman pasca bencana dan kerusuhan sosial;",
    "pelaksanaan koordinasi penyediaan lahan dan pengembangan hunian;",
    "pelaksanaan koordinasi pemanfaatan dan penghunian perumahan;",
    "pelaksanaan fasilitasi bina usaha dan perlindungan konsumen perumahan;",
    "pelaksanaan koordinasi dan fasilitasi forum perumahan dan kawasan permukiman;",
    "pelaksanaan, pemantauan, evaluasi, dan koordinasi fasilitasi pembiayaan perumahan;",
    "pelaksanaan fasilitasi serah terima aset;",
    "pelaksanaan dan koordinasi reformasi birokrasi, pembangunan zona integritas, sistem pengendalian intern, sistem manajemen risiko, serta sistem pengendalian anti korupsi dan penyuapan; dan",
    "pelaksanaan urusan tata usaha, umum dan rumah tangga, komunikasi publik, serta layanan hukum balai."
  ]
};

export const layananKlinik: Layanan[] = [
  {
    id: 1,
    icon: "FileText",
    title: "Informasi",
    description: "Menyediakan akses informasi serta alternatif teknis dan non-teknis bagi masyarakat berpenghasilan rendah dalam menanggulangi masalah perumahan, berfungsi sebagai 'clearing house' atau rumah bersama.",
  },
  {
    id: 2,
    icon: "FileQuestion",
    title: "Konsultasi",
    description: "Memberikan edukasi mengenai prosedur pembangunan, mekanisme legalitas tanah, hingga rencana anggaran guna meningkatkan kesadaran akan hunian yang layak.",
  },
  {
    id: 3,
    icon: "ClipboardList",
    title: "Pendampingan dan Bantuan Teknis",
    description: "Memberikan bimbingan langsung selama proses pembangunan atau perbaikan rumah guna mewujudkan hunian yang memenuhi standar layak huni.",
  },
];

export const sejarah = {
  title: "Sejarah Singkat",
  paragraphs: [
    "Balai Pelaksanaan Perumahan, Permukiman, dan Kawasan Perdesaan (BP3KP) Sumatera II dibentuk sebagai bagian dari upaya pemerintah untuk meningkatkan kualitas perumahan dan permukiman di Indonesia, khususnya di wilayah Sumatera Utara.",
    "Dengan wilayah kerja yang mencakup Provinsi Sumatera Utara, BP3KP Sumatera II memiliki peran strategis dalam mendukung program-program Kementerian PUPR di tingkat daerah.",
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
