/**
 * usePenerimaanMap Hook
 * 
 * DESKRIPSI: Hook untuk mengelola peta Leaflet pada halaman Penerimaan BSPS
 * Menghandle inisialisasi map, markers, dan interaksi
 * 
 * FITUR:
 * - Dynamic import Leaflet (client-side only)
 * - Auto update markers saat filter berubah
 * - Custom marker icons dengan SVG
 * - Popup dengan informasi detail
 */

import { useEffect, useRef, useState } from "react";

import {
  penerimaanStatusColors,
  penerimaanStatusLabels,
  type DesaPenerimaan,
} from "@/data/penerimaan-bsps";

import type * as L from "leaflet";

// ============================================
// Types
// ============================================

export interface UsePenerimaanMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  isMapReady: boolean;
}

// ============================================
// SVG Marker Generators
// ============================================

function createDesaMarkerSvg(
  desaId: number,
  jumlahPenerima: number,
  fillColor: string
): string {
  return `
    <svg width="45" height="56" viewBox="0 0 45 56" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${desaId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M22.5 2 C 12 2, 4 10, 4 20 C 4 32, 22.5 52, 22.5 52 C 22.5 52, 41 32, 41 20 C 41 10, 33 2, 22.5 2 Z" 
            fill="${fillColor}" 
            stroke="white" 
            stroke-width="3" 
            filter="url(#shadow-${desaId})"/>
      <text x="22.5" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${jumlahPenerima}</text>
    </svg>
  `;
}

function createRecipientMarkerSvg(desaId: number): string {
  return `
    <svg width="28" height="35" viewBox="0 0 28 35" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-recipient-${desaId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M14 1 C 8 1, 3 6, 3 12 C 3 19, 14 32, 14 32 C 14 32, 25 19, 25 12 C 25 6, 20 1, 14 1 Z" 
            fill="hsl(191, 79%, 35%)" 
            stroke="white" 
            stroke-width="2" 
            filter="url(#shadow-recipient-${desaId})"/>
      <circle cx="14" cy="12" r="5" fill="white"/>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" 
            transform="translate(2.5, 3.5) scale(0.4)" 
            stroke="hsl(191, 79%, 35%)" 
            stroke-width="2" 
            fill="none"/>
      <circle cx="14" cy="10.5" r="2" fill="hsl(191, 79%, 35%)"/>
    </svg>
  `;
}

// ============================================
// Popup Content Generator
// ============================================

function createDesaPopupContent(desa: DesaPenerimaan, statusColor: string): string {
  const statusLabel = penerimaanStatusLabels[desa.status];
  const sp2dCount = Math.floor(desa.jumlahPenerima * 0.8);

  return `
    <div style="padding: 12px; min-width: 280px; background: white; border-radius: 8px;">
      <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 10px; color: #1e293b;">${desa.nama}</h3>
      <div style="display: grid; gap: 8px; font-size: 13px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div>
            <span style="font-weight: 600; color: #64748b; font-size: 11px;">Kabupaten:</span>
            <p style="color: #334155; margin: 2px 0 0 0; font-size: 12px;">${desa.kabupaten}</p>
          </div>
          <div>
            <span style="font-weight: 600; color: #64748b; font-size: 11px;">Kecamatan:</span>
            <p style="color: #334155; margin: 2px 0 0 0; font-size: 12px;">${desa.kecamatan}</p>
          </div>
        </div>
        <div>
          <span style="font-weight: 600; color: #64748b; font-size: 11px;">Desa:</span>
          <p style="color: #334155; margin: 2px 0 0 0; font-size: 12px;">${desa.nama}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
          <div>
            <span style="font-weight: 600; color: #64748b; font-size: 11px;">Alokasi Unit:</span>
            <p style="color: #334155; margin: 2px 0 0 0; font-size: 12px; font-weight: 600;">${desa.jumlahPenerima} unit</p>
          </div>
          <div>
            <span style="font-weight: 600; color: #64748b; font-size: 11px;">Total SK PPK:</span>
            <p style="color: #334155; margin: 2px 0 0 0; font-size: 12px; font-weight: 600;">${desa.jumlahPenerima} unit</p>
          </div>
        </div>
        <div>
          <span style="font-weight: 600; color: #64748b; font-size: 11px;">SP2D:</span>
          <p style="color: #334155; margin: 2px 0 0 0; font-size: 12px; font-weight: 600;">${sp2dCount} unit</p>
        </div>
      </div>
      <span style="display: inline-block; margin-top: 10px; padding: 4px 12px; font-size: 11px; font-weight: 600; border-radius: 12px; color: white; background: ${statusColor};">
        ${statusLabel}
      </span>
    </div>
  `;
}

// ============================================
// Hook Implementation
// ============================================

export function usePenerimaanMap(filteredDesa: DesaPenerimaan[]): UsePenerimaanMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // ============================================
  // Initialize Map
  // ============================================

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    const initializeMap = async () => {
      const L = (await import("leaflet")).default;
      const container = mapRef.current;

      if (!container) return;

      // Check container dimensions
      if (container.offsetWidth === 0) {
        setTimeout(initializeMap, 100);
        return;
      }

      // Clean container before init
      type LeafletContainer = HTMLDivElement & { _leaflet_id?: number | null };
      if ((container as LeafletContainer)._leaflet_id) {
        (container as LeafletContainer)._leaflet_id = null;
        container.innerHTML = "";
      }

      const map = L.map(container, {
        center: [3.6, 98.7],
        zoom: 11,
        zoomControl: true,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Error removing map:", e);
        }
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // ============================================
  // Update Markers
  // ============================================

  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current!;

      // Clear previous markers
      markersRef.current.forEach((marker) => {
        try {
          map.removeLayer(marker);
        } catch {
          // Ignore removal errors
        }
      });
      markersRef.current = [];

      // Add new markers
      filteredDesa.forEach((desa) => {
        const colors = penerimaanStatusColors[desa.status];

        // Circle area
        const circle = L.circle(desa.coordinates, {
          radius: 800,
          color: colors.stroke,
          fillColor: colors.fill,
          fillOpacity: 0.3,
          weight: 2,
        }).addTo(map);
        markersRef.current.push(circle);

        // Center marker icon
        const centerIcon = L.divIcon({
          html: createDesaMarkerSvg(desa.id, desa.jumlahPenerima, colors.fill),
          className: "custom-marker",
          iconSize: [45, 56],
          iconAnchor: [22.5, 56],
          popupAnchor: [0, -56],
        });

        const centerMarker = L.marker(desa.coordinates, { icon: centerIcon }).addTo(map);
        markersRef.current.push(centerMarker);

        // Bind popup
        centerMarker.bindPopup(createDesaPopupContent(desa, colors.fill));

        // Click handler for circle - show recipients
        circle.on("click", () => {
          map.setView(desa.coordinates, 16);

          desa.penerimaList.forEach((penerima) => {
            const recipientIcon = L.divIcon({
              html: createRecipientMarkerSvg(desa.id),
              className: "custom-marker",
              iconSize: [28, 35],
              iconAnchor: [14, 35],
              popupAnchor: [0, -35],
            });

            const recipientMarker = L.marker(penerima.coordinates, { icon: recipientIcon })
              .addTo(map)
              .bindPopup(`
                <div style="padding: 10px; background: white; border-radius: 6px; min-width: 180px;">
                  <h4 style="font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 4px;">${penerima.nama}</h4>
                  <p style="font-size: 12px; color: #64748b; margin: 0;">${penerima.alamat}</p>
                </div>
              `);
            markersRef.current.push(recipientMarker);
          });
        });
      });
    };

    updateMarkers();
  }, [filteredDesa, isMapReady]);

  return {
    mapRef,
    isMapReady,
  };
}
