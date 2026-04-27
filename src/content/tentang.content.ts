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
  description:
    "BP3KP Sumatera II merupakan unit pelaksana teknis di lingkungan Kementerian Perumahan dan Kawasan Permukiman yang melaksanakan layanan teknis operasional di bidang perumahan, permukiman, dan kawasan perdesaan di wilayah Sumatera Utara.",
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
    description:
      "Menyediakan informasi program, layanan, dan rujukan teknis maupun nonteknis agar masyarakat lebih mudah memahami alur bantuan perumahan.",
  },
  {
    id: 2,
    icon: "FileQuestion",
    title: "Konsultasi",
    description:
      "Memberikan konsultasi mengenai prosedur pembangunan, legalitas tanah, pembiayaan, dan kebutuhan dasar hunian yang layak.",
  },
  {
    id: 3,
    icon: "ClipboardList",
    title: "Pendampingan dan Bantuan Teknis",
    description:
      "Memberikan pendampingan dan bantuan teknis pada proses pembangunan atau perbaikan rumah agar hasilnya lebih aman, fungsional, dan layak huni.",
  },
];

export const sejarah = {
  title: "Sejarah Singkat",
  paragraphs: [
    "Balai Pelaksanaan Perumahan, Permukiman, dan Kawasan Perdesaan (BP3KP) Sumatera II dibentuk untuk memperkuat penyelenggaraan layanan perumahan dan permukiman di wilayah Sumatera Utara.",
    "Dengan wilayah kerja yang mencakup Provinsi Sumatera Utara, BP3KP Sumatera II berperan penting dalam menghubungkan kebijakan pusat dengan kebutuhan pelayanan teknis di daerah.",
    "Klinik PKP hadir sebagai wujud komitmen BP3KP Sumatera II untuk menyediakan layanan informasi, konsultasi, dan pendampingan teknis yang lebih dekat, responsif, dan mudah diakses masyarakat.",
  ],
};

export const nilaiNilai = [
  {
    icon: "Target",
    title: "Profesional",
    description:
      "Bekerja dengan kompetensi yang terukur dan standar layanan yang jelas.",
  },
  {
    icon: "Heart",
    title: "Peduli",
    description:
      "Mengutamakan kepentingan masyarakat serta keberlanjutan lingkungan hunian.",
  },
  {
    icon: "Zap",
    title: "Responsif",
    description:
      "Cepat tanggap dalam memberikan arahan, layanan, dan solusi yang dibutuhkan.",
  },
  {
    icon: "Shield",
    title: "Integritas",
    description:
      "Menjunjung tinggi kejujuran, transparansi, dan akuntabilitas pelayanan.",
  },
];
