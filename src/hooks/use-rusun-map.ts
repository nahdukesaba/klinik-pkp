"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { RusunData } from "@/data/peta-sebaran-rusun";

// ============================================
// Types
// ============================================
interface UseRusunMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapReady: boolean;
  isClient: boolean;
  flyToLocation: (lat: number, lng: number, zoom?: number) => void;
  flyToRegion: (lat: number, lng: number, zoom: number) => void;
}

// ============================================
// Constants
// ============================================
const DEFAULT_CENTER: [number, number] = [3.5952, 98.6722];
const DEFAULT_ZOOM = 12;

const MARKER_ICON_SVG = `
  <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
    </defs>
    <path d="M20 2 C 11 2, 4 9, 4 18 C 4 28, 20 46, 20 46 C 20 46, 36 28, 36 18 C 36 9, 29 2, 20 2 Z" 
          fill="hsl(191, 79%, 35%)" 
          stroke="white" 
          stroke-width="2.5" 
          filter="url(#shadow)"/>
    <circle cx="20" cy="18" r="7" fill="white"/>
    <path d="M17 18l9-7 9 7v11a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2z" 
          transform="translate(-6, 11) scale(0.5)" 
          fill="hsl(191, 79%, 35%)"/>
  </svg>
`;

// ============================================
// Popup Content Generator
// ============================================
function createPopupContent(rusun: RusunData): string {
  const imageSection = rusun.image
    ? `<div style="margin: -8px -8px 0 -8px; height: 140px; overflow: hidden; border-radius: 4px 4px 0 0;">
        <img src="${rusun.image}" alt="${rusun.name}" style="width: 100%; height: 100%; object-fit: cover;" />
       </div>`
    : "";

  const headerStyle = rusun.image
    ? "padding: 12px 16px;"
    : "margin: -8px -8px 12px -8px; border-radius: 4px 4px 0 0; padding: 12px 16px;";

  return `
    <div style="min-width: 320px; font-family: system-ui, sans-serif;">
      ${imageSection}
      <div style="background: linear-gradient(135deg, hsl(191, 79%, 25%), hsl(195, 85%, 21%)); color: white; ${headerStyle}">
        <h3 style="font-weight: bold; font-size: 14px; margin: 0;">${rusun.name}</h3>
      </div>
      <div style="padding: 12px 8px 8px 8px; font-size: 12px; color: #64748b;">
        <p style="margin-bottom: 8px;">
          <strong style="color: #1e293b;">Alamat:</strong> 
          ${rusun.address}, Kel. ${rusun.kelurahan}, Kec. ${rusun.kecamatan}, ${rusun.kabupaten}
        </p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div><strong style="color: #1e293b;">Jumlah Unit:</strong> ${rusun.units}</div>
          <div><strong style="color: #1e293b;">Jumlah Tower:</strong> ${rusun.tower}</div>
          <div><strong style="color: #1e293b;">Jumlah Lantai:</strong> ${rusun.floors}</div>
          <div><strong style="color: #1e293b;">Tipe:</strong> ${rusun.type}</div>
          <div><strong style="color: #1e293b;">Tahun Pembangunan:</strong> ${rusun.yearBuilt}</div>
          <div><strong style="color: #1e293b;">Tahun Serah Terima:</strong> ${rusun.yearHandover}</div>
          <div><strong style="color: #1e293b;">Unit Terisi:</strong> ${rusun.unitsFilled} / ${rusun.units}</div>
        </div>
        <p style="margin-top: 8px;">
          <strong style="color: #1e293b;">Kontraktor:</strong> ${rusun.contractor}
        </p>
      </div>
    </div>
  `;
}

// ============================================
// Hook Implementation
// ============================================
export function useRusunMap(
  filteredRusun: RusunData[],
  onRusunClick?: (rusun: RusunData) => void
): UseRusunMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side detection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        const container = mapRef.current;

        if (!container || container.offsetWidth === 0) {
          setTimeout(initMap, 100);
          return;
        }

        const map = L.map(container, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
          dragging: true,
          touchZoom: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Create markers layer group
        markersLayerRef.current = L.layerGroup().addTo(map);

        // Fix dimension issues
        setTimeout(() => map.invalidateSize(), 100);

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Error removing map:", e);
        }
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        setMapReady(false);
      }
    };
  }, [isClient]);

  // Update markers when filtered data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady || !markersLayerRef.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      const markersLayer = markersLayerRef.current!;

      // Clear existing markers
      markersLayer.clearLayers();

      // Create custom icon
      const customIcon = L.divIcon({
        html: MARKER_ICON_SVG,
        className: "custom-marker",
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50],
      });

      // Add markers for each rusun
      filteredRusun.forEach((rusun) => {
        const marker = L.marker([rusun.lat, rusun.lng], { icon: customIcon });

        marker.bindPopup(createPopupContent(rusun), { maxWidth: 350 });
        marker.on("mouseover", () => marker.openPopup());
        marker.on("click", () => onRusunClick?.(rusun));

        markersLayer.addLayer(marker);
      });
    };

    updateMarkers();
  }, [filteredRusun, mapReady, onRusunClick]);

  // Fly to specific location
  const flyToLocation = useCallback((lat: number, lng: number, zoom = 14) => {
    mapInstanceRef.current?.setView([lat, lng], zoom);
  }, []);

  // Fly to region with animation
  const flyToRegion = useCallback((lat: number, lng: number, zoom: number) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, []);

  return {
    mapRef,
    mapReady,
    isClient,
    flyToLocation,
    flyToRegion,
  };
}
