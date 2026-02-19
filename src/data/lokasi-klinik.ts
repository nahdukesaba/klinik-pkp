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
  address: "Jl. Suluh No.99, Sidorejo Hilir, Kec. Medan Tembung, Kota Medan, Sumatera Utara 20222",
  coordinates: [3.5952, 98.6722],
  phone: "0822 4696 0231",
  email: "klinikpkpsumateraii@gmail.com",
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
  phone: "+6282246960231",
  email: "klinikpkpsumateraii@gmail.com",
  whatsapp: "6282246960231",
  address: {
    street: "Jl. Suluh No.99",
    kelurahan: "Sidorejo Hilir",
    kecamatan: "Medan Tembung",
    city: "Kota Medan",
    province: "Sumatera Utara",
    postalCode: "20222",
    country: "Indonesia",
  },
  googleMapsQuery: "3.5952,98.6722",
};
