"use client";

import { useState, useRef, useMemo, useCallback } from "react";

import { sosialisasiLocations } from "@/data/sosialisasi-klinik";

export interface SosialisasiLocation {
  id: number;
  name: string;
  kabupaten: string;
  kecamatan?: string;
  kelurahan?: string;
  alamat: string;
  coordinates: [number, number];
  date: string;
  time: string;
  status: "selesai" | "mendatang";
  peserta?: number;
  images: string[];
}

export function useSosialisasiPKPMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const LeafletRef = useRef<typeof import("leaflet") | null>(null);
  const filteredLocationsRef = useRef<SosialisasiLocation[]>([]);
  
  const [mapKabupatenFilter, setMapKabupatenFilter] = useState<string>("all");
  const [mapKecamatanFilter, setMapKecamatanFilter] = useState<string>("all");
  const [mapKelurahanFilter, setMapKelurahanFilter] = useState<string>("all");
  const [mapStatusFilter, setMapStatusFilter] = useState<string>("all");
  const [mapSearchQuery, setMapSearchQuery] = useState<string>("");
  const [mapReady, setMapReady] = useState(false);
  const [mapShowFilters, setMapShowFilters] = useState(true);

  // Get unique lists for filters
  const mapKabupatenList = useMemo(() => {
    return ["all", ...Array.from(new Set(sosialisasiLocations.map(loc => loc.kabupaten)))];
  }, []);

  const mapKecamatanList = useMemo(() => {
    const filtered = mapKabupatenFilter === "all" 
      ? sosialisasiLocations 
      : sosialisasiLocations.filter(loc => loc.kabupaten === mapKabupatenFilter);
    return ["all", ...Array.from(new Set(filtered.map(loc => loc.kecamatan).filter(Boolean) as string[]))];
  }, [mapKabupatenFilter]);

  const mapKelurahanList = useMemo(() => {
    let filtered = sosialisasiLocations;
    if (mapKabupatenFilter !== "all") {
      filtered = filtered.filter(loc => loc.kabupaten === mapKabupatenFilter);
    }
    if (mapKecamatanFilter !== "all") {
      filtered = filtered.filter(loc => loc.kecamatan === mapKecamatanFilter);
    }
    return ["all", ...Array.from(new Set(filtered.map(loc => loc.kelurahan).filter(Boolean) as string[]))];
  }, [mapKabupatenFilter, mapKecamatanFilter]);

  const filteredMapLocations = useMemo(() => {
    let result = sosialisasiLocations;
    
    // Search filter
    if (mapSearchQuery.trim()) {
      const query = mapSearchQuery.toLowerCase().trim();
      result = result.filter((loc) => 
        loc.name.toLowerCase().includes(query) ||
        loc.kabupaten.toLowerCase().includes(query) ||
        (loc.kecamatan && loc.kecamatan.toLowerCase().includes(query)) ||
        (loc.kelurahan && loc.kelurahan.toLowerCase().includes(query)) ||
        (loc.alamat && loc.alamat.toLowerCase().includes(query))
      );
    }
    
    if (mapKabupatenFilter !== "all") {
      result = result.filter((loc) => loc.kabupaten === mapKabupatenFilter);
    }
    
    if (mapKecamatanFilter !== "all") {
      result = result.filter((loc) => loc.kecamatan === mapKecamatanFilter);
    }
    
    if (mapKelurahanFilter !== "all") {
      result = result.filter((loc) => loc.kelurahan === mapKelurahanFilter);
    }
    
    if (mapStatusFilter !== "all") {
      result = result.filter((loc) => loc.status === mapStatusFilter);
    }
    
    return result;
  }, [mapKabupatenFilter, mapKecamatanFilter, mapKelurahanFilter, mapStatusFilter, mapSearchQuery]);

  // Update ref immediately when filtered locations change (sync, not effect)
  filteredLocationsRef.current = filteredMapLocations;

  // Add markers to map - STABLE (no dependencies)
  const addMarkersToMap = useCallback((L: typeof import("leaflet"), map: L.Map, onImageClick?: (images: string[], index: number, title: string) => void) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      try {
        marker.remove();
      } catch {}
    });
    markersRef.current = [];

    // Add filtered markers - use ref to get latest value
    filteredLocationsRef.current.forEach((loc, index) => {
      const isUpcoming = loc.status === "mendatang";
      const markerColor = isUpcoming ? "#eab308" : "#0E5B73";

      // Calculate offset for overlapping markers using spiral pattern
      // This ensures markers at same location don't overlap
      const sameLocationMarkers = filteredLocationsRef.current.filter(
        (l, i) => i < index && 
          Math.abs(l.coordinates[0] - loc.coordinates[0]) < 0.001 && 
          Math.abs(l.coordinates[1] - loc.coordinates[1]) < 0.001
      );
      
      const overlapIndex = sameLocationMarkers.length;
      const angle = overlapIndex * (2.4); // Golden angle for spiral
      const radius = 0.0008 * Math.sqrt(overlapIndex); // Spiral radius grows
      
      const offsetCoordinates: [number, number] = overlapIndex > 0 
        ? [
            loc.coordinates[0] + radius * Math.cos(angle),
            loc.coordinates[1] + radius * Math.sin(angle)
          ]
        : loc.coordinates;

      const markerIcon = L.divIcon({
        html: `
          <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
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
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50],
      });

      const formattedDate = new Date(loc.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const imagesHtml =
        loc.images.length > 0
          ? `
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          ${loc.images
            .slice(0, 3)
            .map(
              (img, idx) => `
            <img 
              src="${img}" 
              alt="${loc.name} ${idx + 1}" 
              style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: 1px solid #e5e7eb;"
              onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'"
              data-image-gallery='${JSON.stringify(loc.images)}'
              data-image-index="${idx}"
              data-image-title="${loc.name}"
            />
          `
            )
            .join("")}
        </div>
        ${loc.images.length > 3 ? `<p style="font-size: 11px; color: #6b7280; text-align: center; margin-top: 6px;">+${loc.images.length - 3} foto lainnya</p>` : ''}
      `
          : "";

      const statusBadgeStyle = isUpcoming
        ? "background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border: 1px solid #fcd34d;"
        : "background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; border: 1px solid #93c5fd;";

      // Responsive popup - smaller on mobile
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const popupPadding = isMobile ? '12px' : '16px';
      const popupMinWidth = isMobile ? '220px' : '280px';
      const popupMaxWidth = isMobile ? '280px' : '320px';
      const titleFontSize = isMobile ? '14px' : '16px';
      const textFontSize = isMobile ? '12px' : '13px';
      const iconSize = isMobile ? '16px' : '18px';
      const imageSize = isMobile ? 'width: 60px; height: 45px;' : 'width: 80px; height: 60px;';

      const popupContent = `
        <div style="padding: ${popupPadding}; min-width: ${popupMinWidth}; max-width: ${popupMaxWidth}; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="font-size: ${titleFontSize}; font-weight: 700; color: #111827; margin: 0 0 10px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; line-height: 1.3;">${loc.name}</h3>
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${loc.alamat ? `
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span style="font-size: 13px; color: #374151; line-height: 1.4;">${loc.alamat}</span>
            </div>
            ` : ''}
            
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span style="font-size: 13px; color: #374151; line-height: 1.4;">${loc.kelurahan ? `${loc.kelurahan}, ` : ""}${loc.kecamatan ? `${loc.kecamatan}, ` : ""}${loc.kabupaten}</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span style="font-size: 13px; color: #374151; font-weight: 500;">${formattedDate}</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style="font-size: 13px; color: #374151; font-weight: 500;">${loc.time}</span>
            </div>
            
            ${loc.peserta ? `
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg style="width: 18px; height: 18px; flex-shrink: 0; color: #0E5B73;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span style="font-size: 13px; color: #374151; font-weight: 500;">${loc.peserta} peserta</span>
            </div>
            ` : ''}
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
          maxWidth: isMobile ? 300 : 380,
          minWidth: isMobile ? 220 : 280,
          className: "custom-popup",
        });

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
                if (onImageClick) {
                  onImageClick(gallery, index, title);
                }
              });
            });
          }
        }, 0);
      });

      markersRef.current.push(marker);
    });
  }, []); // STABLE - tidak ada dependencies

  // Initialize map - STABLE (addMarkersToMap stable)
  const initializeMap = useCallback((onImageClick?: (images: string[], index: number, title: string) => void) => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const container = mapRef.current;

    // Clean up any existing Leaflet instance
    // @ts-expect-error - Leaflet adds _leaflet_id to DOM elements
    if (container._leaflet_id) {
      // @ts-expect-error - Leaflet adds _leaflet_id to DOM elements
      delete container._leaflet_id;
      container.innerHTML = '';
    }

    import("leaflet").then((L) => {
        if (mapInstanceRef.current) return;

        try {
          LeafletRef.current = L;
          
          const map = L.map(container, {
            center: [3.2, 99.0],
            zoom: 8,
            zoomControl: true,
          });

          mapInstanceRef.current = map;

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(map);

        // Add legend - elegant modern style
        const LegendControl = L.Control.extend({
          options: { position: 'topright' },
          onAdd: function() {
            const div = L.DomUtil.create('div', 'map-legend');
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
          }
        });
        
        map.addControl(new LegendControl());

        map.whenReady(() => {
          map.invalidateSize();
          setMapReady(true);
          
          // Add markers immediately after map is ready
          addMarkersToMap(L, map, onImageClick);
        });

      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }).catch((error) => {
      console.error("Error loading Leaflet:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // STABLE - addMarkersToMap stable, tidak perlu dependency

  // Update markers when filters change - uses filteredMapLocations length as trigger
  const updateMarkers = useCallback((onImageClick?: (images: string[], index: number, title: string) => void) => {
    if (!mapInstanceRef.current || !LeafletRef.current) return;
    
    const map = mapInstanceRef.current;
    const L = LeafletRef.current;
    
    addMarkersToMap(L, map, onImageClick);
  }, [addMarkersToMap]);

  // Fly to a specific location on the map
  const flyToLocation = useCallback((coordinatesOrId: [number, number] | number) => {
    if (!mapInstanceRef.current) return;
    
    let coordinates: [number, number];
    
    // Check if it's an ID or coordinates
    if (typeof coordinatesOrId === 'number') {
      const location = sosialisasiLocations.find(loc => loc.id === coordinatesOrId);
      if (!location) return;
      coordinates = location.coordinates;
    } else {
      coordinates = coordinatesOrId;
    }
    
    // Scroll to map section with full focus
    const mapSection = document.getElementById('peta-sosialisasi');
    if (mapSection) {
      // Scroll with extra offset to ensure map is fully visible
      const yOffset = -20; // Small offset from top
      const y = mapSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    
    // Wait a bit for scroll then fly to location
    setTimeout(() => {
      if (!mapInstanceRef.current) return;
      
      mapInstanceRef.current.flyTo(coordinates, 16, {
        duration: 1.5,
      });
      
      // Find and open the marker popup - increase tolerance for offset markers
      setTimeout(() => {
        const marker = markersRef.current.find((m) => {
          const latLng = m.getLatLng();
          return Math.abs(latLng.lat - coordinates[0]) < 0.005 && 
                 Math.abs(latLng.lng - coordinates[1]) < 0.005;
        });
        
        if (marker) {
          marker.openPopup();
        }
      }, 1500);
    }, 300);
  }, []);

  // Cleanup map
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn("Error during cleanup:", e);
      }
      mapInstanceRef.current = null;
    }
    
    LeafletRef.current = null;
    markersRef.current = [];
    
    const container = mapRef.current;
    if (container) {
      // @ts-expect-error - Leaflet adds _leaflet_id to DOM elements
      if (container._leaflet_id) {
        // @ts-expect-error - Leaflet adds _leaflet_id to DOM elements
        delete container._leaflet_id;
      }
      container.innerHTML = '';
    }
    
    setMapReady(false);
  }, []);

  return {
    mapRef,
    mapInstanceRef,
    mapReady,
    initializeMap,
    updateMarkers,
    cleanupMap,
    flyToLocation,
    filteredMapLocations,
    mapKabupatenFilter,
    setMapKabupatenFilter,
    mapKecamatanFilter,
    setMapKecamatanFilter,
    mapKelurahanFilter,
    setMapKelurahanFilter,
    mapStatusFilter,
    setMapStatusFilter,
    mapSearchQuery,
    setMapSearchQuery,
    mapKabupatenList,
    mapKecamatanList,
    mapKelurahanList,
    mapShowFilters,
    setMapShowFilters,
  };
}
