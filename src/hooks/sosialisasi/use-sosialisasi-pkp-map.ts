"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";

import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { CURRENT_YEAR } from "@/lib/constants";
import { formatDateId } from "@/lib/date";
import { loadLeaflet, cleanupMapContainer, destroyMap, bindMarkerInteraction } from "@/lib/map-utils";
import { escapeHtml, escapeAttr, sanitizeUrl } from "@/lib/security";
import { type SosialisasiLocation } from "@/services/sosialisasi.service";

import type * as Leaflet from "leaflet";

import "leaflet/dist/leaflet.css";

interface UseSosialisasiPKPMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapReady: boolean;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  // Filter states
  mapYear: string;
  setMapYear: (year: string) => void;
  mapYears: number[];
  mapKabupatenFilter: string;
  setMapKabupatenFilter: (value: string) => void;
  mapKecamatanFilter: string;
  setMapKecamatanFilter: (value: string) => void;
  mapKelurahanFilter: string;
  setMapKelurahanFilter: (value: string) => void;
  mapStatusFilter: string;
  setMapStatusFilter: (value: string) => void;
  // Filter lists
  mapKabupatenList: string[];
  mapKecamatanList: string[];
  mapKelurahanList: string[];
  // Search
  mapSearchQuery: string;
  setMapSearchQuery: (value: string) => void;
  mapShowFilters: boolean;
  setMapShowFilters: (value: boolean) => void;
  // Filtered data
  filteredMapLocations: SosialisasiLocation[];
}

/**
 * Hook untuk mengelola peta sosialisasi PKP.
 *
 * Menerima data mentah dari useSosialisasiData (Variabel A)
 * dan menghasilkan data terfilter + map instance (Variabel B).
 *
 * @param allLocations - Semua lokasi sosialisasi dari useSosialisasiData
 * @param isEnabled - Apakah map sudah di-mount (lazy loading)
 * @param onImageClick - Callback untuk klik gambar di popup
 */
export function useSosialisasiPKPMap(
  allLocations: SosialisasiLocation[],
  isEnabled: boolean = true,
  onImageClick?: (images: string[], index: number, title: string) => void
): UseSosialisasiPKPMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const markersRef = useRef<Leaflet.Marker[]>([]);

  const [mapReady, setMapReady] = useState(false);
  // Default: tahun sekarang agar peta langsung fokus ke data tahun ini
  const [mapYear, setMapYear] = useState<string>(CURRENT_YEAR);
  const [mapStatusFilter, setMapStatusFilter] = useState<string>("mendatang");
  const [mapSearchQuery, setMapSearchQuery] = useState<string>("");
  const [mapShowFilters, setMapShowFilters] = useState(true);
  const enabledRef = useRef<boolean>(isEnabled);
  const onImageClickRef = useRef(onImageClick);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(mapSearchQuery, 300);

  // Use shared cascading filter for kabupaten/kecamatan/kelurahan
  const cascading = useCascadingFilter(allLocations);

  // Daftar tahun yang tersedia dari semua lokasi
  const mapYears = useMemo(() => {
    const years = [
      ...new Set(allLocations.map((loc) => Number.parseInt(loc.date.slice(0, 4), 10))),
    ].filter(Number.isFinite);
    return years.sort((a, b) => b - a);
  }, [allLocations]);

  // Combined filtering (cascading + year + status + search)
  const filteredMapLocations = useMemo(() => {
    let result = cascading.filteredItems;

    // Filter by year (default: tahun sekarang)
    if (mapYear !== "all") {
      result = result.filter((loc) => loc.date.slice(0, 4) === mapYear);
    }

    // Filter by status
    if (mapStatusFilter !== "all") {
      result = result.filter((loc) => loc.status === mapStatusFilter);
    }

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      result = result.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query) ||
          loc.kabupaten.toLowerCase().includes(query) ||
          (loc.kecamatan?.toLowerCase().includes(query) ?? false) ||
          (loc.kelurahan?.toLowerCase().includes(query) ?? false) ||
          loc.alamat.toLowerCase().includes(query)
      );
    }

    return result;
  }, [cascading.filteredItems, mapYear, mapStatusFilter, debouncedSearchQuery]);

  // Expose cascading filter lists with "all" prefix for backward compatibility
  const mapKabupatenList = useMemo(
    () => ["all", ...cascading.filterLists.kabupatenList],
    [cascading.filterLists.kabupatenList]
  );
  const mapKecamatanList = useMemo(
    () => ["all", ...cascading.filterLists.kecamatanList],
    [cascading.filterLists.kecamatanList]
  );
  const mapKelurahanList = useMemo(
    () => ["all", ...cascading.filterLists.kelurahanList],
    [cascading.filterLists.kelurahanList]
  );

  useEffect(() => {
    enabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    onImageClickRef.current = onImageClick;
  }, [onImageClick]);

  // Add markers to map.
  const addMarkersToMap = useCallback(
    (
      L: typeof import("leaflet"),
      map: Leaflet.Map
    ) => {

      // Clear existing markers
      markersRef.current.forEach((marker) => {
        try {
          marker.remove();
        } catch { }
      });
      markersRef.current = [];

      // Add filtered markers - use filteredMapLocations
      filteredMapLocations.forEach((loc: SosialisasiLocation, index: number) => {
        const isUpcoming = loc.status === "mendatang";
        const markerColor = isUpcoming ? "#eab308" : "#0E5B73";

        // Calculate offset for overlapping markers using spiral pattern
        // This ensures markers at same location don't overlap
        const sameLocationMarkers = filteredMapLocations.filter(
          (l: SosialisasiLocation, i: number) =>
            i < index &&
            Math.abs(l.coordinates[0] - loc.coordinates[0]) < 0.001 &&
            Math.abs(l.coordinates[1] - loc.coordinates[1]) < 0.001
        );

        const overlapIndex = sameLocationMarkers.length;
        const angle = overlapIndex * 2.4; // Golden angle for spiral
        const radius = 0.0008 * Math.sqrt(overlapIndex); // Spiral radius grows

        const offsetCoordinates: [number, number] =
          overlapIndex > 0
            ? [
              loc.coordinates[0] + radius * Math.cos(angle),
              loc.coordinates[1] + radius * Math.sin(angle),
            ]
            : loc.coordinates;

        // Gunakan variabel L dari parameter, bukan global
        const markerIcon = L.divIcon({
          html: `
          <svg width="48" height="60" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow-${loc.id}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
              </filter>
            </defs>
            <path d="M20 2 C 11 2, 4 9, 4 18 C 4 28, 20 46, 20 46 C 20 46, 36 28, 36 18 C 36 9, 29 2, 20 2 Z" 
                  fill="${markerColor}" 
                  stroke="white" 
                  stroke-width="2.5" 
                  filter="url(#shadow-${loc.id})"/>
            <circle cx="20" cy="18" r="7" fill="white"/>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" 
                  transform="translate(11, 9) scale(0.45)" 
                  stroke="${markerColor}" 
                  stroke-width="2" 
                  fill="none"/>
            <circle cx="20" cy="16" r="2.5" fill="${markerColor}"/>
          </svg>
        `,
          className: "custom-marker",
          iconSize: [48, 60],
          iconAnchor: [24, 60],
          popupAnchor: [0, -60],
        });

        const formattedDate = formatDateId(loc.scheduledAtStart);

        const imagesHtml =
          loc.images.length > 0
            ? `
        <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 12px;">
          ${loc.images
              .slice(0, 3)
              .map(
                (img: string, idx: number) => `
            <img 
              src="${escapeAttr(sanitizeUrl(img))}" 
              alt="${escapeAttr(loc.name)} ${idx + 1}" 
              style="display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 10px; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);"
              data-image-gallery='${escapeAttr(JSON.stringify(loc.images))}'
              data-image-index="${idx}"
              data-image-title="${escapeAttr(loc.name)}"
            />
          `
              )
              .join("")}
        </div>
        ${loc.images.length > 3
              ? `<p style="font-size: 11px; color: #6b7280; text-align: center; margin-top: 6px;">+${loc.images.length - 3} foto lainnya</p>`
              : ""
            }
      `
            : "";

        const statusBadgeStyle = isUpcoming
          ? "background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border: 1px solid #fcd34d;"
          : "background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; border: 1px solid #93c5fd;";

        // Responsive popup - smaller on mobile
        const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
        const popupPadding = isMobile ? "12px" : "16px";
        const popupWidth = isMobile ? "min(300px, calc(100vw - 48px))" : "320px";
        const titleFontSize = isMobile ? "14px" : "16px";

        const popupContent = `
        <div style="padding: ${popupPadding}; width: ${popupWidth}; max-width: 100%; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="font-size: ${titleFontSize}; font-weight: 700; color: #111827; margin: 0 0 10px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; line-height: 1.3;">${escapeHtml(loc.name)}</h3>
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${loc.alamat
            ? `
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span style="display: block; flex: 1; min-width: 0; font-size: 13px; color: #374151; line-height: 1.45; overflow-wrap: anywhere;">${escapeHtml(loc.alamat)}</span>
            </div>
            `
            : ""
          }
            
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span style="display: block; flex: 1; min-width: 0; font-size: 13px; color: #374151; line-height: 1.45; overflow-wrap: anywhere;">${loc.kelurahan ? `${escapeHtml(loc.kelurahan)}, ` : ""}${loc.kecamatan ? `${escapeHtml(loc.kecamatan)}, ` : ""}${escapeHtml(loc.kabupaten)}</span>
            </div>
            
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span style="display: block; flex: 1; min-width: 0; font-size: 13px; color: #374151; font-weight: 500; line-height: 1.45; overflow-wrap: normal; word-break: normal;">${escapeHtml(formattedDate)}</span>
            </div>
            
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style="display: block; flex: 1; min-width: 0; font-size: 13px; color: #374151; font-weight: 500; line-height: 1.45; overflow-wrap: normal; word-break: normal;">${escapeHtml(loc.time)}</span>
            </div>
            
            ${loc.peserta
            ? `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span style="display: block; flex: 1; min-width: 0; font-size: 13px; color: #374151; font-weight: 500; line-height: 1.45; overflow-wrap: normal; word-break: normal;">${escapeHtml(loc.peserta.toString())} peserta</span>
            </div>
            `
            : ""
          }
          </div>
          
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <span style="display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; ${statusBadgeStyle}">
              ${isUpcoming ? "📅 Mendatang" : "✓ Selesai"}
            </span>
          </div>
          
          ${imagesHtml}
        </div>
      `;

        const marker = L.marker(offsetCoordinates, { icon: markerIcon })
          .addTo(map)
          .bindPopup(popupContent, {
            maxWidth: isMobile ? 320 : 380,
            minWidth: isMobile ? 0 : 280,
            className: "custom-popup",
          });

        bindMarkerInteraction(marker);

        marker.on("popupopen", () => {
          setTimeout(() => {
            const popup = document.querySelector(".leaflet-popup-content");
            if (popup) {
              const images = popup.querySelectorAll("img[data-image-gallery]");
              images.forEach((img) => {
                img.addEventListener("click", (e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const gallery = JSON.parse(target.getAttribute("data-image-gallery") || "[]");
                  const index = parseInt(target.getAttribute("data-image-index") || "0");
                  const title = target.getAttribute("data-image-title") || "";
                  if (onImageClickRef.current) {
                    onImageClickRef.current(gallery, index, title);
                  }
                });
              });
            }
          }, 0);
        });

        markersRef.current.push(marker);
      });
    },
    [filteredMapLocations]
  );

  // Initialize map with smooth zoom options
  useEffect(() => {
    if (!isEnabled) return;
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    const container = mapRef.current;

    // Clean up any existing Leaflet instance
    cleanupMapContainer(container);

    loadLeaflet()
      .then((L) => {
        if (mapInstanceRef.current) return;

        try {
          // Initialize map with smooth zoom options
          const map = L.map(container, {
            center: [3.2, 99.0],
            zoom: 8,
            zoomControl: true,
            // Smooth zoom options
            zoomSnap: 0.25,
            zoomDelta: 0.5,
            wheelDebounceTime: 40,
            wheelPxPerZoomLevel: 120,
            // Smooth animations
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true,
          });

          mapInstanceRef.current = map;

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(map);

          // Add legend - elegant modern style
          const LegendControl = L.Control.extend({
            options: { position: "topright" },
            onAdd: function () {
              const div = L.DomUtil.create("div", "map-legend");
              div.innerHTML = `
              <div style="background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                <div style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 10px; letter-spacing: 0.3px;">Keterangan</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #0E5B73 0%, #0a4a5e 100%); box-shadow: 0 2px 4px rgba(14,91,115,0.3);"></div>
                    <span style="font-size: 12px; color: #4b5563; font-weight: 500;">Selesai</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); box-shadow: 0 2px 4px rgba(234,179,8,0.3);"></div>
                    <span style="font-size: 12px; color: #4b5563; font-weight: 500;">Mendatang</span>
                  </div>
                </div>
              </div>
            `;
              L.DomEvent.disableClickPropagation(div);
              L.DomEvent.disableScrollPropagation(div);
              return div;
            },
          });

          map.addControl(new LegendControl());

          // Aggressive invalidation for lazy-loaded/dynamic containers
          const resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          });
          resizeObserver.observe(container);

          setTimeout(() => map.invalidateSize(), 100);
          setTimeout(() => map.invalidateSize(), 500);

          setMapReady(true);

          map.whenReady(() => {
            map.invalidateSize();
          });
        } catch {
          // Map initialization failed silently
        }
      })
      .catch(() => {
        // Leaflet loading failed silently
      });

    return () => {
      destroyMap(mapInstanceRef.current);
      mapInstanceRef.current = null;
      markersRef.current = [];
      cleanupMapContainer(container);
      setMapReady(false);
    };
  }, [isEnabled]);

  // Update markers when filtered locations change
  useEffect(() => {
    if (!isEnabled || !mapReady || !mapInstanceRef.current) return;

    (async () => {
      // dynamic import to ensure L is available on client
      const mod = await loadLeaflet();
      if (mapInstanceRef.current) {
        addMarkersToMap(mod, mapInstanceRef.current);
      }
    })();
  }, [isEnabled, mapReady, filteredMapLocations, addMarkersToMap]);

  // Fly to a specific location on the map with smooth animation
  const flyTo = useCallback((lat: number, lng: number, zoom: number = 16) => {
    if (!enabledRef.current) return;
    if (!mapInstanceRef.current) return;

    const coordinates: [number, number] = [lat, lng];

    const mapSection = document.getElementById("peta-sosialisasi");
    if (mapSection) {
      const yOffset = -20;
      const y = mapSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    setTimeout(() => {
      if (!mapInstanceRef.current) return;

      // Smooth fly animation with easing
      mapInstanceRef.current.flyTo(coordinates, zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });

      setTimeout(() => {
        const marker = markersRef.current.find((m) => {
          const latLng = m.getLatLng();
          return (
            Math.abs(latLng.lat - coordinates[0]) < 0.005 &&
            Math.abs(latLng.lng - coordinates[1]) < 0.005
          );
        });

        if (marker) marker.openPopup();
      }, 1200);
    }, 300);
  }, []);

  return {
    mapRef,
    mapReady,
    flyTo,
    mapYear,
    setMapYear,
    mapYears,
    mapKabupatenFilter: cascading.filterState.kabupatenFilter,
    setMapKabupatenFilter: cascading.filterActions.setKabupatenFilter,
    mapKecamatanFilter: cascading.filterState.kecamatanFilter,
    setMapKecamatanFilter: cascading.filterActions.setKecamatanFilter,
    mapKelurahanFilter: cascading.filterState.kelurahanFilter,
    setMapKelurahanFilter: cascading.filterActions.setKelurahanFilter,
    mapStatusFilter,
    setMapStatusFilter,
    mapSearchQuery,
    setMapSearchQuery,
    mapKabupatenList,
    mapKecamatanList,
    mapKelurahanList,
    mapShowFilters,
    setMapShowFilters,
    filteredMapLocations,
  };
}
