"use client";

/**
 * Hook: usePenerimaanMap
 * Mengelola peta Leaflet untuk halaman Penerimaan BSPS.
 */

import { useEffect, useRef, useState } from "react";

import "leaflet/dist/leaflet.css";

import { loadLeaflet, cleanupMapContainer, destroyMap, bindMarkerInteraction, buildSafePopup } from "@/lib/map-utils";
import { escapeAttr, escapeHtml } from "@/lib/security";
import {
  bspsStatusColors,
  bspsStatusLabels,
  type BspsData,
} from "@/services/bsps.service";

import type * as L from "leaflet";

interface UsePenerimaanMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  isMapReady: boolean;
}

function createDesaMarkerSvg(
  desaId: number,
  alokasiUnit: number,
  fillColor: string
): string {
  return `
    <svg width="52" height="64" viewBox="0 0 45 56" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${escapeAttr(String(desaId))}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M22.5 2 C 12 2, 4 10, 4 20 C 4 32, 22.5 52, 22.5 52 C 22.5 52, 41 32, 41 20 C 41 10, 33 2, 22.5 2 Z" 
            fill="${escapeAttr(fillColor)}" 
            stroke="white" 
            stroke-width="3" 
            filter="url(#shadow-${escapeAttr(String(desaId))})"/>
      <text x="22.5" y="24" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${escapeHtml(String(alokasiUnit))}</text>
    </svg>
  `;
}

function createRecipientMarkerSvg(desaId: number): string {
  return `
    <svg width="34" height="42" viewBox="0 0 28 35" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-recipient-${escapeAttr(String(desaId))}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M14 1 C 8 1, 3 6, 3 12 C 3 19, 14 32, 14 32 C 14 32, 25 19, 25 12 C 25 6, 20 1, 14 1 Z" 
            fill="hsl(191, 79%, 35%)" 
            stroke="white" 
            stroke-width="2" 
            filter="url(#shadow-recipient-${escapeAttr(String(desaId))})"/>
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

function createDesaPopupContent(desa: BspsData, statusColor: string): string {
  const statusLabel = bspsStatusLabels[desa.status];

  return buildSafePopup({
    title: desa.nama,
    headerColor: statusColor,
    gridFirst: true,
    gridFields: [
      { label: "Kelurahan", value: desa.kelurahan },
      { label: "Kecamatan", value: desa.kecamatan },
    ],
    fields: [
      { label: "Kabupaten", value: desa.kabupaten },
    ],
    extraHtml: `
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 8px 0 6px 0;" />
      <p style="margin: 0; font-weight: 600; color: #1e293b;">
        Alokasi Unit: <span style="color: ${escapeAttr(statusColor)};">${escapeHtml(String(desa.alokasiUnit))} unit</span>
      </p>
    `,
    statusBadge: {
      label: statusLabel,
      color: statusColor,
    },
  });
}

export function usePenerimaanMap(
  filteredDesa: BspsData[],
  isEnabled: boolean = true
): UsePenerimaanMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    loadLeaflet().then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        cleanupMapContainer(mapRef.current);

        const map = L.map(mapRef.current, {
          center: [2.5, 99.0],
          zoom: 8,
          zoomControl: true,
          dragging: true,
          touchZoom: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          // enable smoother animations
          zoomAnimation: true,
          fadeAnimation: true,
          inertia: true,
          zoomSnap: 0,
          zoomDelta: 0.25,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // add a markers layer group for easier clearing
        markersLayerRef.current = L.layerGroup().addTo(map);

        // ResizeObserver to handle dynamic layouts (flex, sticky, etc.)
        const resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        resizeObserver.observe(mapRef.current);

        // Force map to recalculate size (important for lazy loaded containers)
        setTimeout(() => map.invalidateSize(), 100);
        setTimeout(() => map.invalidateSize(), 300);
        setTimeout(() => map.invalidateSize(), 800);

        mapInstanceRef.current = map;
        setIsMapReady(true);
      } catch {
        // Map initialization failed silently
      }
    });

    return () => {
      destroyMap(mapInstanceRef.current);
      mapInstanceRef.current = null;
      setIsMapReady(false);
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled || !mapInstanceRef.current || !isMapReady) return;

    const updateMarkers = async () => {
      const L = await loadLeaflet();
      const map = mapInstanceRef.current!;

      // Clear existing markers via LayerGroup
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      }

      filteredDesa.forEach((desa) => {
        const colors = bspsStatusColors[desa.status];

        const circle = L.circle(desa.coordinates, {
          radius: 800,
          color: colors.stroke,
          fillColor: colors.fill,
          fillOpacity: 0.3,
          weight: 2,
        }).addTo(map);
        markersLayerRef.current?.addLayer(circle);

        const centerIcon = L.divIcon({
          html: createDesaMarkerSvg(desa.id, desa.alokasiUnit, colors.fill),
          className: "custom-marker",
          iconSize: [52, 64],
          iconAnchor: [26, 64],
          popupAnchor: [0, -64],
        });

        const centerMarker = L.marker(desa.coordinates, { icon: centerIcon }).addTo(map);
        markersLayerRef.current?.addLayer(centerMarker);

        centerMarker.bindPopup(createDesaPopupContent(desa, colors.fill));
        bindMarkerInteraction(centerMarker);

        circle.on("click", () => {
          // smooth fly to desa center
          map.stop();
          map.flyTo(desa.coordinates, 16, { animate: true, duration: 1.1, easeLinearity: 0.12 });

          desa.penerimaList.forEach((penerima) => {
            const recipientIcon = L.divIcon({
              html: createRecipientMarkerSvg(desa.id),
              className: "custom-marker",
              iconSize: [34, 42],
              iconAnchor: [17, 42],
              popupAnchor: [0, -42],
            });

            const recipientMarker = L.marker(penerima.coordinates, { icon: recipientIcon })
              .bindPopup(
                buildSafePopup({
                  title: penerima.nama,
                  headerColor: "hsl(191, 79%, 35%)",
                  fields: [
                    { label: "Alamat", value: penerima.alamat },
                  ],
                })
              );

            markersLayerRef.current?.addLayer(recipientMarker.addTo(map));
          });
        });
      });

      // adjust map view to show markers (if any)
      setTimeout(() => {
        try {
          map.invalidateSize();
          if (filteredDesa.length > 0) {
            const bounds = L.latLngBounds(filteredDesa.map((d) => d.coordinates));
            map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2, maxZoom: 12 });
          }
        } catch {
          // Ignore fitBounds errors
        }
      }, 300);
    };

    updateMarkers();
  }, [filteredDesa, isMapReady, isEnabled]);

  return {
    mapRef,
    isMapReady,
  };
}
