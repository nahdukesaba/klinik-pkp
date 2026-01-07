/**
 * Peta Data - Sebaran Rusun
 * Data untuk halaman Peta Sebaran Rusun
 */

export interface RusunData {
  id: string;
  name: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  address: string;
  lat: number;
  lng: number;
  units: number;
  tower: number;
  type: string;
  floors: number;
  yearBuilt: number;
  yearHandover: number;
  unitsFilled: number;
  contractor: string;
  image?: string;
}

export interface RusunRegionCenter {
  lat: number;
  lng: number;
  zoom: number;
  name: string;
}

export const rusunDataList: RusunData[] = [
  {
    id: "1",
    name: "Rusun Kejaksaan Tinggi",
    kabupaten: "Medan",
    kecamatan: "Medan Barat",
    kelurahan: "Sei Agul",
    address: "Jl. Karya Rakyat",
    lat: 3.6065,
    lng: 98.6624,
    units: 16,
    tower: 1,
    type: "Wisma Suralaya 36",
    floors: 2,
    yearBuilt: 2016,
    yearHandover: 2020,
    unitsFilled: 16,
    contractor: "PT. Hagitasinar Lestarimegah",
    image: "/rusun.jpeg",
  },
];

export const rusunRegionCenters: Record<string, RusunRegionCenter> = {
  medan: { lat: 3.5952, lng: 98.6722, zoom: 11, name: "Kota Medan" },
  "sumatera-utara": {
    lat: 3.3,
    lng: 99.0,
    zoom: 8,
    name: "Sumatera Utara",
  },
};
