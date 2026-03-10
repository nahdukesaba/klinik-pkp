/**
 * Map Utilities
 *
 * Shared utilities untuk inisialisasi dan manajemen peta Leaflet.
 * Termasuk: dynamic loading, cleanup, marker interaction, dan popup builder.
 *
 * Fitur keamanan:
 * - Semua konten popup di-escape via escapeHtml/escapeAttr (anti-XSS)
 * - URL di-sanitize via sanitizeUrl sebelum dirender ke HTML
 *
 * @module map-utils
 */

import { escapeHtml, escapeAttr, sanitizeUrl } from "@/lib/security";

import type * as L from "leaflet";

// Hoist RegExp ke module-level untuk popup HTML sanitization.
// Ref: vercel-react-best-practices/js-hoist-regexp
const RE_SCRIPT_TAGS = /<script[^>]*>[\s\S]*?<\/script>/gi;
const RE_SELF_CLOSING_SCRIPT = /<script[^>]*\/>/gi;
const RE_EVENT_ATTR_QUOTED = /on\w+\s*=\s*["'][^"']*["']/gi;
const RE_EVENT_ATTR_UNQUOTED = /on\w+\s*=\s*\S+/gi;
const RE_JAVASCRIPT_URI = /javascript\s*:/gi;
const RE_DATA_TEXT_HTML = /data\s*:\s*text\/html/gi;

export interface MapInitOptions {
  center: [number, number];
  zoom: number;
  zoomControl?: boolean;
  dragging?: boolean;
  touchZoom?: boolean;
  scrollWheelZoom?: boolean;
  doubleClickZoom?: boolean;
}

const DEFAULT_MAP_OPTIONS: Partial<MapInitOptions> = {
  zoomControl: true,
  dragging: true,
  touchZoom: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
};

/**
 * Muat modul Leaflet secara dinamis
 */
export async function loadLeaflet(): Promise<typeof L> {
  const mod = await import("leaflet");
  const Lmod = mod as typeof import("leaflet") & { default?: typeof import("leaflet") };
  return (Lmod.default ?? Lmod) as typeof import("leaflet");
}

/**
 * Bersihkan kontainer Leaflet untuk mencegah masalah re-inisialisasi
 */
export function cleanupMapContainer(container: HTMLElement | null): void {
  if (!container) return;

  type LeafletContainer = HTMLElement & { _leaflet_id?: number };
  const leafletContainer = container as LeafletContainer;

  if (leafletContainer._leaflet_id) {
    delete leafletContainer._leaflet_id;
    container.innerHTML = "";
  }
}

/**
 * Cek apakah kontainer sudah diinisialisasi Leaflet
 */
export function isMapInitialized(container: HTMLElement | null): boolean {
  if (!container) return false;
  type LeafletContainer = HTMLElement & { _leaflet_id?: number };
  return !!(container as LeafletContainer)._leaflet_id;
}

/**
 * Buat instance peta Leaflet
 */
export function createMap(
  L: typeof import("leaflet"),
  container: HTMLElement,
  options: MapInitOptions
): L.Map {
  const mergedOptions = { ...DEFAULT_MAP_OPTIONS, ...options };

  const map = L.map(container, {
    center: mergedOptions.center,
    zoom: mergedOptions.zoom,
    zoomControl: mergedOptions.zoomControl,
    dragging: mergedOptions.dragging,
    touchZoom: mergedOptions.touchZoom,
    scrollWheelZoom: mergedOptions.scrollWheelZoom,
    doubleClickZoom: mergedOptions.doubleClickZoom,
  });

  // Tambahkan tile layer OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Sesuaikan ukuran setelah mount
  setTimeout(() => map.invalidateSize(), 100);
  setTimeout(() => map.invalidateSize(), 500);

  return map;
}

/**
 * Hapus instance peta Leaflet dengan aman
 */
export function destroyMap(map: L.Map | null): void {
  if (!map) return;
  try {
    map.remove();
  } catch {
    // Abaikan error saat cleanup
  }
}

/**
 * Bind interaksi hover+klik ke layer Leaflet (marker, circle, polygon).
 * - Desktop: hover menampilkan popup, mouse keluar menyembunyikan
 * - Klik: popup tetap terbuka (mouseout tidak menutup)
 * - Mobile: tap membuka popup dan tetap terbuka
 *
 * UX yang baik untuk pengguna desktop dan mobile,
 * terutama untuk pengguna yang butuh waktu lebih lama membaca popup.
 */
export function bindMarkerInteraction(
  layer: L.Layer,
  options?: { onClick?: () => void }
): void {
  let isPinned = false;

  layer.on("mouseover", () => {
    (layer as unknown as L.Marker).openPopup();
  });

  layer.on("mouseout", () => {
    if (!isPinned) {
      (layer as unknown as L.Marker).closePopup();
    }
  });

  layer.on("click", () => {
    isPinned = true;
    (layer as unknown as L.Marker).openPopup();
    options?.onClick?.();
  });

  layer.on("popupclose", () => {
    isPinned = false;
  });
}

/**
 * Template ikon SVG marker standar
 */
export function createMarkerSvg(color: string, id: string | number): string {
  return `
    <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${escapeAttr(String(id))}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 2 C 11 2, 4 9, 4 18 C 4 28, 20 46, 20 46 C 20 46, 36 28, 36 18 C 36 9, 29 2, 20 2 Z" 
            fill="${escapeAttr(color)}" 
            filter="url(#shadow-${escapeAttr(String(id))})"
            stroke="white" 
            stroke-width="2"/>
      <circle cx="20" cy="18" r="8" fill="white" fill-opacity="0.9"/>
    </svg>
  `;
}

// ============================================
// Pembangun HTML aman untuk popup peta
// ============================================

/**
 * Buat safe popup HTML. Semua data di-escape untuk mencegah XSS.
 * Gunakan fungsi ini di semua map hooks alih-alih template literal langsung.
 *
 * @example
 * marker.bindPopup(buildSafePopup({
 *   title: kawasan.name,
 *   fields: [
 *     { label: "Lokasi", value: kawasan.kelurahan },
 *   ],
 * }));
 */
export interface PopupField {
  label: string;
  value: string | number;
}

export interface SafePopupOptions {
  title: string;
  headerColor?: string;
  headerGradientEnd?: string;
  imageUrl?: string;
  imageAlt?: string;
  fields?: PopupField[];
  gridFields?: PopupField[];
  /** Render gridFields sebelum fields (default: false — fields dulu) */
  gridFirst?: boolean;
  /**
   * HTML tambahan untuk popup. PERINGATAN: Konten ini di-sanitize
   * dengan menghapus semua <script> tags dan event handlers.
   * Untuk keamanan maksimal, gunakan `extraFields` sebagai gantinya.
   */
  extraHtml?: string;
  /** Fields tambahan yang di-render dengan auto-escaping (lebih aman dari extraHtml) */
  extraFields?: PopupField[];
  statusBadge?: { label: string; color: string };
}

export function buildSafePopup(options: SafePopupOptions): string {
  const {
    title,
    headerColor = "hsl(191, 79%, 35%)",
    headerGradientEnd,
    imageUrl,
    imageAlt,
    fields = [],
    gridFields = [],
    statusBadge,
  } = options;

  const safeTitle = escapeHtml(title);
  const safeHeaderColor = escapeAttr(headerColor);
  const safeGradientEnd = headerGradientEnd
    ? escapeAttr(headerGradientEnd)
    : `${safeHeaderColor}dd`;

  const imageSection =
    imageUrl
      ? `<div style="height: 160px; overflow: hidden; border-radius: 8px 8px 0 0;">
          <img src="${escapeAttr(sanitizeUrl(imageUrl))}" alt="${escapeAttr(imageAlt ?? title)}" 
               style="width: 100%; height: 100%; object-fit: cover; display: block;" />
         </div>`
      : "";

  const headerStyle = imageUrl
    ? "padding: 10px 14px;"
    : "border-radius: 8px 8px 0 0; padding: 10px 14px;";

  const fieldsHtml = fields
    .map(
      (f) => `
      <p style="margin: 0 0 6px 0; overflow-wrap: break-word; word-break: break-word;">
        <strong style="color: #1e293b;">${escapeHtml(f.label)}:</strong> ${escapeHtml(String(f.value))}
      </p>`
    )
    .join("");

  const gridHtml =
    gridFields.length > 0
      ? `<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px 10px; font-size: 12px; margin-top: 6px;">
          ${gridFields
            .map(
              (f) =>
                `<div style="overflow-wrap: break-word;"><strong style="color: #1e293b;">${escapeHtml(f.label)}:</strong> ${escapeHtml(String(f.value))}</div>`
            )
            .join("")}
         </div>`
      : "";

  // Sanitize extraHtml — hapus script tags dan event handlers untuk mencegah XSS
  const rawExtraHtml = options.extraHtml ?? "";
  const extraSection = rawExtraHtml
    .replace(RE_SCRIPT_TAGS, "")
    .replace(RE_SELF_CLOSING_SCRIPT, "")
    .replace(RE_EVENT_ATTR_QUOTED, "")
    .replace(RE_EVENT_ATTR_UNQUOTED, "")
    .replace(RE_JAVASCRIPT_URI, "")
    .replace(RE_DATA_TEXT_HTML, "");

  // Render extraFields dengan auto-escaping (cara aman)
  const extraFieldsHtml = (options.extraFields ?? [])
    .map(
      (f) => `
      <p style="margin: 0 0 6px 0; overflow-wrap: break-word; word-break: break-word;">
        <strong style="color: #1e293b;">${escapeHtml(f.label)}:</strong> ${escapeHtml(String(f.value))}
      </p>`
    )
    .join("");

  const badgeHtml = statusBadge
    ? `<div style="margin-top: 8px;">
        <span style="display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 600; border-radius: 12px; color: white; background: ${escapeAttr(statusBadge.color)};">
          ${escapeHtml(statusBadge.label)}
        </span>
       </div>`
    : "";

  return `
    <div style="min-width: 220px; max-width: 340px; width: max-content; font-family: system-ui, sans-serif;">
      ${imageSection}
      <div style="background: linear-gradient(135deg, ${safeHeaderColor}, ${safeGradientEnd}); color: white; ${headerStyle}">
        <h3 style="font-weight: bold; font-size: 14px; margin: 0; line-height: 1.3; word-break: break-word;">${safeTitle}</h3>
      </div>
      <div style="padding: 10px 12px 12px 12px; font-size: 12px; color: #64748b; line-height: 1.5;">
        ${options.gridFirst ? gridHtml : fieldsHtml}
        ${options.gridFirst ? fieldsHtml : gridHtml}
        ${extraSection}
        ${extraFieldsHtml}
        ${badgeHtml}
      </div>
    </div>
  `;
}

// Re-export security helpers for map hooks convenience
export { escapeHtml, escapeAttr, sanitizeUrl } from "@/lib/security";
