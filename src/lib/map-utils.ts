/** Map Utilities — Leaflet dynamic loading, cleanup, marker interaction, popup builder. */

import { escapeHtml, escapeAttr, sanitizeUrl } from "@/lib/security";

import type * as L from "leaflet";

export type LatLngTuple = [number, number];

// Hoist RegExp ke module-level untuk popup HTML sanitization
const RE_SCRIPT_TAGS = /<script[^>]*>[\s\S]*?<\/script>/gi;
const RE_SELF_CLOSING_SCRIPT = /<script[^>]*\/>/gi;
const RE_EVENT_ATTR_QUOTED = /on\w+\s*=\s*["'][^"']*["']/gi;
const RE_EVENT_ATTR_UNQUOTED = /on\w+\s*=\s*\S+/gi;
const RE_JAVASCRIPT_URI = /javascript\s*:/gi;
const RE_DATA_TEXT_HTML = /data\s*:\s*text\/html/gi;

/** Muat modul Leaflet secara dinamis. */
export async function loadLeaflet(): Promise<typeof L> {
  const mod = await import("leaflet");
  const Lmod = mod as typeof import("leaflet") & { default?: typeof import("leaflet") };
  return (Lmod.default ?? Lmod) as typeof import("leaflet");
}

/** Bersihkan kontainer untuk mencegah masalah re-inisialisasi. */
export function cleanupMapContainer(container: HTMLElement | null): void {
  if (!container) return;

  type LeafletContainer = HTMLElement & { _leaflet_id?: number };
  const leafletContainer = container as LeafletContainer;

  if (leafletContainer._leaflet_id) {
    delete leafletContainer._leaflet_id;
    container.innerHTML = "";
  }
}

/** Hapus instance peta Leaflet dengan aman. */
export function destroyMap(map: L.Map | null): void {
  if (!map) return;
  try {
    map.remove();
  } catch {
    // Abaikan error saat cleanup
  }
}

export function isValidMapCoordinate(
  coordinate: readonly [number, number] | null | undefined
) {
  if (!coordinate) {
    return false;
  }

  const [lat, lng] = coordinate;

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export function getOffsetMapCoordinate<T>(
  items: readonly T[],
  index: number,
  getCoordinate: (item: T) => LatLngTuple,
  options: {
    overlapThreshold?: number;
    offsetStep?: number;
  } = {}
): LatLngTuple {
  const coordinate = getCoordinate(items[index]);
  const overlapThreshold = options.overlapThreshold ?? 0.00035;
  const offsetStep = options.offsetStep ?? 0.00055;
  const overlapIndex = items
    .slice(0, index)
    .filter((item) => {
      const other = getCoordinate(item);
      return (
        Math.abs(other[0] - coordinate[0]) <= overlapThreshold &&
        Math.abs(other[1] - coordinate[1]) <= overlapThreshold
      );
    }).length;

  if (overlapIndex === 0) {
    return coordinate;
  }

  const angle = overlapIndex * 2.399963229728653;
  const radius = offsetStep * Math.sqrt(overlapIndex);

  return [
    coordinate[0] + radius * Math.cos(angle),
    coordinate[1] + radius * Math.sin(angle),
  ];
}

/**
 * Bind interaksi hover+klik ke layer Leaflet.
 * Desktop: hover buka popup, klik pin popup. Mobile: tap buka popup.
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

// --- Popup Builder ---

/** Buat safe popup HTML. Semua data di-escape untuk mencegah XSS. */
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
   * HTML tambahan (di-sanitize: script tags & event handlers dihapus).
   * Untuk keamanan maksimal, gunakan extraFields.
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


