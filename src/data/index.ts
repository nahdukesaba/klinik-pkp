/**
 * Data Layer - Central Export
 * 
 * File data statis untuk konten yang TIDAK memiliki API endpoint.
 * Data dinamis (Bank Desain, BSPS, Kawasan Kumuh, Sosialisasi, Rusun)
 * sudah dipindahkan ke folder services/ dan diakses melalui API.
 */

// Housing Indicators Data (Landing Page — tidak ada API)
export * from "../content/housing-indicators";

// Building Steps Data (Landing Page — tidak ada API)
export * from "../content/building-steps";

// Informasi Data (Bahan Bangunan, FAQ, Peraturan, Perizinan — tidak ada API)
export * from "../content/informasi";

// Lokasi Klinik Data (tidak ada API)
export * from "../content/lokasi-klinik";

// Tentang Data (About BP3KP — tidak ada API)
export * from "../content/tentang";
