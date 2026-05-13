/**
 * Hook: useKawasanKumuhMap
 * Mengelola peta Leaflet dan marker untuk halaman Kawasan Kumuh.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import "leaflet/dist/leaflet.css";

import {
  bindMarkerInteraction,
  buildSafePopup,
  cleanupMapContainer,
  destroyMap,
  getOffsetMapCoordinate,
  isValidMapCoordinate,
  loadLeaflet,
} from "@/lib/map-utils";
import { escapeAttr } from "@/lib/security";
import {
  kawasanStatusColors,
  type KawasanKumuhData,
} from "@/services/kawasan-kumuh.service";

import type * as L from "leaflet";

// --- Pure Logic: Kewenangan berdasarkan luas kawasan ---

/**
 * Menentukan kewenangan penanganan kawasan kumuh berdasarkan luas.
 * Aturan: <10 Ha → Kab/Kota, 10–15 Ha → Provinsi, >15 Ha → Pemerintah Pusat
 */
function getKewenangan(luas: number): string {
  if (luas < 10) return "Kab/Kota (< 10 Ha)";
  if (luas <= 15) return "Provinsi (10–15 Ha)";
  return "Pemerintah Pusat (> 15 Ha)";
}

interface UseKawasanKumuhMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  isMapReady: boolean;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

export function useKawasanKumuhMap(
  filteredKawasan: KawasanKumuhData[],
  onKawasanSelect: (kawasan: KawasanKumuhData) => void,
  isEnabled: boolean = true
): UseKawasanKumuhMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    let resizeObserver: ResizeObserver | undefined;

    loadLeaflet().then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      cleanupMapContainer(mapRef.current);

      const regionData = { lat: 3.3, lng: 99.0, zoom: 8 };

      const map = L.map(mapRef.current, {
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: true,
        markerZoomAnimation: true,
      }).setView([regionData.lat, regionData.lng], 8);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 500);

      // ResizeObserver to handle dynamic layout changes
      if (mapRef.current) {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(mapRef.current);
      }

      map.on("click", (e) => {
        e.originalEvent?.stopPropagation();
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    });

    return () => {
      resizeObserver?.disconnect();
      destroyMap(mapInstanceRef.current);
      mapInstanceRef.current = null;
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled || !isMapReady || !mapInstanceRef.current) return;

    loadLeaflet().then((L) => {
      if (!mapInstanceRef.current) return;

      const statusColors = kawasanStatusColors;

      mapInstanceRef.current.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          layer.remove();
        }
      });

      const displayedKawasan = filteredKawasan.filter((kawasan) =>
        isValidMapCoordinate([kawasan.lat, kawasan.lng])
      );

      displayedKawasan.forEach((kawasan, index) => {
        if (!mapInstanceRef.current) return;

        const statusColor = statusColors[kawasan.status];
        const displayCoordinate = getOffsetMapCoordinate(
          displayedKawasan,
          index,
          (item) => [item.lat, item.lng],
          { offsetStep: 0.00065 }
        );

        L.circle(displayCoordinate, {
          color: statusColor.fill,
          fillColor: statusColor.fill,
          fillOpacity: 0.5,
          radius: kawasan.luas * 50,
        }).addTo(mapInstanceRef.current!);

        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
              width: 36px;
              height: 36px;
              background-color: ${escapeAttr(statusColor.fill)};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              cursor: pointer;
              transition: transform 0.2s;
            "></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker(displayCoordinate, { icon })
          .addTo(mapInstanceRef.current!)
          .bindPopup(
            buildSafePopup({
              title: kawasan.name,
              headerColor: statusColor.fill,
              fields: [
                { label: "Lingkungan", value: kawasan.lingkungan.join(",  ") },
                { label: "Lokasi", value: `Kel. ${kawasan.kelurahan}, Kec. ${kawasan.kecamatan}, ${kawasan.kabupaten}` },
                { label: "Kewenangan", value: getKewenangan(kawasan.luas) },
              ],
              gridFields: [
                { label: "Luas", value: `${kawasan.luas} Ha` },
                { label: "Penduduk", value: kawasan.penduduk === 0 ? "-" : `${kawasan.penduduk.toLocaleString("id-ID")} jiwa` },
                { label: "Legalitas", value: kawasan.legalitasLahan },
              ],
              statusBadge: {
                label: statusColor.label,
                color: statusColor.fill,
              },
            }),
            { maxWidth: 350 }
          );

        bindMarkerInteraction(marker, {
          onClick: () => onKawasanSelect(kawasan),
        });
      });

      if (displayedKawasan.length > 0) {
        mapInstanceRef.current!.invalidateSize();
        setTimeout(() => {
          if (!mapInstanceRef.current) return;
          const bounds = L.latLngBounds(displayedKawasan.map((k) => [k.lat, k.lng]));
          mapInstanceRef.current!.fitBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 1.5,
            maxZoom: 15,
          });
        }, 300);
      }
    });
  }, [filteredKawasan, isMapReady, onKawasanSelect, isEnabled]);

  const flyTo = useCallback((lat: number, lng: number, zoom = 15) => {
    if (!isValidMapCoordinate([lat, lng])) {
      return;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, []);

  return {
    mapRef,
    isMapReady,
    flyTo,
  };
}
