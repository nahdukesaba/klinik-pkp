import "server-only";

const TRAILING_SLASHES_PATTERN = /\/+$/;
const LEADING_SLASHES_PATTERN = /^\/+/;

/** Hapus trailing slash agar penggabungan URL backend konsisten. */
export function normalizeBackendApiBaseUrl(value: string) {
  return value.trim().replace(TRAILING_SLASHES_PATTERN, "");
}

/** Hapus leading slash agar path backend tidak jadi dobel. */
export function normalizeBackendPathname(pathname: string) {
  return pathname.replace(LEADING_SLASHES_PATTERN, "");
}

/** Ambil base URL backend dari environment variable bila tersedia. */
export function getConfiguredBackendApiBaseUrl() {
  const apiUrl = process.env.API_URL?.trim();
  return apiUrl ? normalizeBackendApiBaseUrl(apiUrl) : null;
}

/** Paksa base URL backend tersedia. */
export function requireBackendApiBaseUrl() {
  const apiUrl = getConfiguredBackendApiBaseUrl();
  if (!apiUrl) {
    throw new Error("Konfigurasi API_URL belum tersedia.");
  }

  return apiUrl;
}

/** Bangun URL backend penuh dari pathname relatif. */
export function buildConfiguredBackendApiUrl(pathname: string) {
  return `${requireBackendApiBaseUrl()}/${normalizeBackendPathname(pathname)}`;
}
