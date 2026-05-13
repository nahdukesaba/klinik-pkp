/**
 * useRusunMap — Inisialisasi peta Leaflet dan manajemen marker untuk Sebaran Rusun.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  bindMarkerInteraction,
  buildSafePopup,
  cleanupMapContainer,
  destroyMap,
  getOffsetMapCoordinate,
  isValidMapCoordinate,
  loadLeaflet,
} from "@/lib/map-utils";
import type { RusunData } from "@/services/rusun.service";

import type * as L from "leaflet";

import "leaflet/dist/leaflet.css";

// --- Konstanta ---

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
          fill="hsl(191, 79%, 35%)" stroke="white" stroke-width="2.5" filter="url(#shadow)"/>
    <circle cx="20" cy="18" r="7" fill="white"/>
    <path d="M17 18l9-7 9 7v11a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2z"
          transform="translate(-6, 11) scale(0.5)" fill="hsl(191, 79%, 35%)"/>
  </svg>
`;

// --- Pembangun popup ---

function createPopupContent(rusun: RusunData): string {
  return buildSafePopup({
    title: rusun.name,
    headerColor: "hsl(191, 79%, 25%)",
    headerGradientEnd: "hsl(195, 85%, 21%)",
    imageUrl: rusun.image || undefined,
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

// --- Hook ---

interface UseRusunMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapReady: boolean;
  flyToLocation: (lat: number, lng: number, zoom?: number) => void;
}

export function useRusunMap(
  filteredRusun: RusunData[],
  onRusunClick?: (rusun: RusunData) => void,
  isEnabled = true,
  sidebarOpen?: boolean,
): UseRusunMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!isEnabled || typeof window === "undefined" || !mapRef.current || mapInstanceRef.current)
      return;

    const container = mapRef.current;

    loadLeaflet().then((L) => {
      if (!container || mapInstanceRef.current) return;

      cleanupMapContainer(container);

      const map = L.map(container, {
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
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120,
      }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        keepBuffer: 6,
        updateWhenZooming: true,
        updateWhenIdle: false,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 500);

      // ResizeObserver — guard dengan ref agar aman saat map sudah di-destroy
      const ro = new ResizeObserver(() => {
        mapInstanceRef.current?.invalidateSize();
      });
      ro.observe(container);
      resizeObserverRef.current = ro;

      map.on("click", (e) => e.originalEvent?.stopPropagation());

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      destroyMap(mapInstanceRef.current);
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      setMapReady(false);
    };
  }, [isEnabled]);

  // Sesuaikan ukuran peta saat sidebar buka/tutup
  useEffect(() => {
    if (!isEnabled || !mapReady || !mapInstanceRef.current) return;
    const timer = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 350);
    return () => clearTimeout(timer);
  }, [sidebarOpen, mapReady, isEnabled]);

  // Perbarui marker di peta
  useEffect(() => {
    if (!isEnabled || !mapReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    loadLeaflet().then((L) => {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;

      markersLayerRef.current.clearLayers();

      const displayedRusun = filteredRusun.filter((rusun) =>
        isValidMapCoordinate([rusun.lat, rusun.lng])
      );

      displayedRusun.forEach((rusun, index) => {
        if (!mapInstanceRef.current) return;
        const displayCoordinate = getOffsetMapCoordinate(
          displayedRusun,
          index,
          (item) => [item.lat, item.lng],
          { offsetStep: 0.0007 }
        );

        const marker = L.marker(displayCoordinate, {
          icon: L.divIcon({
            html: MARKER_ICON_SVG,
            className: "custom-marker",
            iconSize: [48, 60],
            iconAnchor: [24, 60],
            popupAnchor: [0, -60],
          }),
        });

        marker.bindPopup(createPopupContent(rusun), { maxWidth: 350 });
        bindMarkerInteraction(marker, { onClick: () => onRusunClick?.(rusun) });
        markersLayerRef.current!.addLayer(marker);
      });

      // Sesuaikan view setelah marker ditempatkan
      if (displayedRusun.length > 0) {
        mapInstanceRef.current.invalidateSize();
        setTimeout(() => {
          if (!mapInstanceRef.current) return;

          const bounds = L.latLngBounds(displayedRusun.map((r) => [r.lat, r.lng]));
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 1.5,
            maxZoom: 15,
          });
        }, 300);
      }
    });
  }, [filteredRusun, mapReady, onRusunClick, isEnabled]);

  const flyToLocation = useCallback((lat: number, lng: number, zoom = 14) => {
    if (!isValidMapCoordinate([lat, lng])) {
      return;
    }

    mapInstanceRef.current?.stop();
    mapInstanceRef.current?.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.2,
      easeLinearity: 0.1,
    });
  }, []);

  return { mapRef, mapReady, flyToLocation };
}
