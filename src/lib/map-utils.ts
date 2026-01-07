/**
 * Map Utilities
 * 
 * Utility functions untuk operasi map Leaflet.
 * Dipecah dari komponen agar lebih modular dan reusable.
 */

import type { Map as LeafletMap, LatLngExpression } from "leaflet";

/**
 * Check if map container is ready for initialization
 */
export function isMapContainerReady(container: HTMLElement | null): boolean {
  if (!container) return false;
  return container.offsetWidth > 0 && container.offsetHeight > 0;
}

/**
 * Safely initialize map with retry mechanism
 */
export async function initializeMapWithRetry(
  container: HTMLElement | null,
  options: {
    center: LatLngExpression;
    zoom: number;
    maxRetries?: number;
    retryDelay?: number;
  },
  onSuccess: (map: LeafletMap) => void,
  onError?: (error: Error) => void
): Promise<void> {
  const { center, zoom, maxRetries = 5, retryDelay = 100 } = options;
  let retries = 0;

  const tryInit = async (): Promise<void> => {
    try {
      if (!container) {
        throw new Error("Map container is null");
      }

      if (!isMapContainerReady(container)) {
        if (retries < maxRetries) {
          retries++;
          setTimeout(tryInit, retryDelay);
          return;
        }
        throw new Error("Map container not ready after max retries");
      }

      const L = (await import("leaflet")).default;
      
      const map = L.map(container, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      onSuccess(map);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  await tryInit();
}

/**
 * Create teardrop marker icon SVG
 */
export function createTeardropMarkerSvg(
  color: string,
  innerIcon?: string
): string {
  return `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z" 
        fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="14" r="8" fill="white" fill-opacity="0.9"/>
      ${innerIcon || ""}
    </svg>
  `;
}

/**
 * Smooth fly to location with animation
 */
export function flyToLocation(
  map: LeafletMap,
  lat: number,
  lng: number,
  zoom: number,
  duration: number = 1.5
): void {
  map.flyTo([lat, lng], zoom, {
    animate: true,
    duration,
    easeLinearity: 0.25,
  });
}

/**
 * Fit bounds with padding and animation
 */
export function fitBoundsWithPadding(
  map: LeafletMap,
  bounds: L.LatLngBoundsExpression,
  padding: [number, number] = [50, 50]
): void {
  map.fitBounds(bounds, {
    padding,
    animate: true,
    duration: 1.5,
  });
}

/**
 * Create popup content HTML dengan styling konsisten
 */
export function createPopupHtml(
  title: string,
  content: Array<{ label: string; value: string }>,
  options?: {
    headerColor?: string;
    showBadge?: boolean;
    badgeText?: string;
    badgeColor?: string;
  }
): string {
  const { headerColor = "#1e293b", showBadge, badgeText, badgeColor } = options || {};
  
  const badgeHtml = showBadge && badgeText ? `
    <div style="margin-bottom: 10px; padding: 6px 10px; background: ${badgeColor}15; border-left: 3px solid ${badgeColor}; border-radius: 4px;">
      <span style="font-size: 11px; font-weight: 600; color: ${badgeColor}; text-transform: uppercase;">
        ${badgeText}
      </span>
    </div>
  ` : "";

  const contentHtml = content.map(({ label, value }) => `
    <div>
      <span style="font-weight: 600; color: #64748b; font-size: 11px; display: block; margin-bottom: 2px;">${label}</span>
      <p style="color: #334155; margin: 0;">${value}</p>
    </div>
  `).join("");

  return `
    <div style="padding: 12px; min-width: 280px; background: white; border-radius: 8px; font-family: system-ui, sans-serif;">
      <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: ${headerColor};">${title}</h3>
      ${badgeHtml}
      <div style="display: grid; gap: 8px; font-size: 12px;">
        ${contentHtml}
      </div>
    </div>
  `;
}
