/**
 * Hook: useRusunMap
 * Mengelola inisialisasi peta dan marker untuk halaman Sebaran Rusun.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { RusunData } from "@/data/peta-sebaran-rusun";
import { loadLeaflet, destroyMap, cleanupMapContainer, bindMarkerInteraction, buildSafePopup } from "@/lib/map-utils";
import { sanitizeUrl } from "@/lib/security";

import type * as L from "leaflet";

import "leaflet/dist/leaflet.css";

// ============================================
// Types
// ============================================
interface UseRusunMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapReady: boolean;
  flyToLocation: (lat: number, lng: number, zoom?: number) => void;
  flyToRegion: (lat: number, lng: number, zoom: number) => void;
}

interface RusunRegionCenter {
  lat: number;
  lng: number;
  zoom: number;
  name: string;
}

// ============================================
// Constants
// ============================================
const DEFAULT_CENTER: [number, number] = [3.5952, 98.6722];
const DEFAULT_ZOOM = 12;

const MARKER_ICON_SVG = `
  <svg width="48" height="60" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
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
// Popup Content Generator (Sanitized)
// ============================================
function createPopupContent(rusun: RusunData): string {
  return buildSafePopup({
    title: rusun.name,
    headerColor: "hsl(191, 79%, 25%)",
    headerGradientEnd: "hsl(195, 85%, 21%)",
    imageUrl: rusun.image ? sanitizeUrl(rusun.image) : undefined,
    imageAlt: rusun.name,
    fields: [
      {
        label: "Alamat",
        value: `${rusun.address}, Kel. ${rusun.kelurahan}, Kec. ${rusun.kecamatan}, ${rusun.kabupaten}`,
      },
    ],
    gridFields: [
      { label: "Jumlah Unit", value: rusun.units },
      { label: "Jumlah Tower", value: rusun.tower },
      { label: "Jumlah Lantai", value: rusun.floors },
      { label: "Tipe", value: rusun.type },
      { label: "Tahun Diberikan", value: rusun.yearGiven },
    ],
  });
}

// ============================================
// Hook Implementation
// ============================================
export function useRusunMap(
  filteredRusun: RusunData[],
  onRusunClick?: (rusun: RusunData) => void,
  isEnabled: boolean = true,
  regionData?: RusunRegionCenter,
  sidebarOpen?: boolean
): UseRusunMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  // Capture initial region data for map initialization only
  const initialRegionRef = useRef(regionData);

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    const initRegion = initialRegionRef.current;
    loadLeaflet().then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      cleanupMapContainer(mapRef.current);

      const initialCenter: [number, number] = initRegion ? [initRegion.lat, initRegion.lng] : DEFAULT_CENTER;
      const initialZoom = initRegion ? initRegion.zoom : DEFAULT_ZOOM;

      const map = L.map(mapRef.current, {
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: true,
        markerZoomAnimation: true,
        zoomAnimation: true,
        fadeAnimation: true,
        inertia: true,
        inertiaDeceleration: 3000,
        // balanced fractional zoom for smoothness without stutter
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120,
      }).setView(initialCenter, initialZoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        keepBuffer: 6,
        updateWhenZooming: true,
        updateWhenIdle: false,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 500);

      map.on("click", (e) => {
        e.originalEvent?.stopPropagation();
      });

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      destroyMap(mapInstanceRef.current);
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      setMapReady(false);
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled || !mapReady || !mapInstanceRef.current) return;

    // Invalidate size after sidebar toggle animation completes
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 350);

    return () => clearTimeout(timer);
  }, [sidebarOpen, mapReady, isEnabled]);

  useEffect(() => {
    if (!isEnabled || !mapReady || !mapInstanceRef.current || !regionData) return;
    mapInstanceRef.current.flyTo([regionData.lat, regionData.lng], regionData.zoom, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [regionData, mapReady, isEnabled]);

  useEffect(() => {
    if (!isEnabled || !mapReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    loadLeaflet().then((L) => {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;

      const markersLayer = markersLayerRef.current;

      markersLayer.clearLayers();

      filteredRusun.forEach((rusun) => {
        if (!mapInstanceRef.current) return;

        const marker = L.marker([rusun.lat, rusun.lng], {
          icon: L.divIcon({
            html: MARKER_ICON_SVG,
            className: "custom-marker",
            iconSize: [48, 60],
            iconAnchor: [24, 60],
            popupAnchor: [0, -60],
          })
        });

        marker.bindPopup(createPopupContent(rusun), { maxWidth: 350 });
        bindMarkerInteraction(marker, {
          onClick: () => onRusunClick?.(rusun),
        });

        markersLayer.addLayer(marker);
      });

      if (filteredRusun.length > 0) {
        mapInstanceRef.current.invalidateSize();
        setTimeout(() => {
          if (!mapInstanceRef.current) return;

          // If a region center is provided and its zoom is for a wide-area (province),
          // prefer flying to the region center instead of fitting bounds to markers.
          if (regionData && regionData.zoom <= 10) {
            mapInstanceRef.current.flyTo([regionData.lat, regionData.lng], regionData.zoom, {
              animate: true,
              duration: 1.5,
              easeLinearity: 0.25,
            });
            return;
          }

          const bounds = L.latLngBounds(filteredRusun.map((r) => [r.lat, r.lng]));
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 1.5,
            maxZoom: 15,
          });
        }, 300);
      } else if (regionData) {
        // No markers to show, but have region center: fly to it.
        mapInstanceRef.current.flyTo([regionData.lat, regionData.lng], regionData.zoom, {
          animate: true,
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    });
  }, [filteredRusun, mapReady, onRusunClick, isEnabled, regionData]);

  const flyToLocation = useCallback((lat: number, lng: number, zoom = 14) => {
    // stop any ongoing motion then smoothly fly
    mapInstanceRef.current?.stop();
    mapInstanceRef.current?.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.2,
      easeLinearity: 0.1,
    });
  }, []);

  const flyToRegion = useCallback((lat: number, lng: number, zoom: number) => {
    mapInstanceRef.current?.stop();
    mapInstanceRef.current?.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.12,
    });
  }, []);

  return {
    mapRef,
    mapReady,
    flyToLocation,
    flyToRegion,
  };
}
