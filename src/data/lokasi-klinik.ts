/**
 * Lokasi Klinik Data
 * Data untuk halaman Lokasi Klinik PKP
 */

export interface OperationalHour {
  day: string;
  hours: string;
}

export interface KlinikData {
  name: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  email: string;
  operationalHours: OperationalHour[];
  services: string[];
}

export const klinikData: KlinikData = {
  name: "Klinik PKP BP3KP Sumatera II",
  address: "Jl. Karya Rakyat No. 123, Medan, Sumatera Utara",
  coordinates: [3.5952, 98.6722],
  phone: "(061) 123-4567",
  email: "klinikpkp@bp3kp.go.id",
  operationalHours: [
    { day: "Senin - Kamis", hours: "07.30 - 16.00 WIB" },
    { day: "Jumat", hours: "07.30 - 16.30 WIB" },
    { day: "Sabtu - Minggu", hours: "Tutup / Libur" },
  ],
  services: [
    "Konsultasi Perumahan",
    "Informasi Program BSPS",
    "Bantuan Teknis Pembangunan",
    "Pendampingan Dokumen",
  ],
};

export const contactInfo = {
  phone: "+62611234567",
  email: "info@bp3kp-sumut2.go.id",
  whatsapp: "62611234567",
  address: {
    street: "Jl. Karya Rakyat No. 123",
    city: "Medan",
    province: "Sumatera Utara",
    country: "Indonesia",
  },
  googleMapsQuery: "3.5952,98.6722",
};
