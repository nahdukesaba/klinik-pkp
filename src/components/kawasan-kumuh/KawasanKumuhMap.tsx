"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";

import type { KawasanKumuh } from "@/data/peta-kawasan-kumuh";
import { kawasanRegionCenters, kawasanStatusColors } from "@/data/peta-kawasan-kumuh";

import type * as L from "leaflet";

interface KawasanKumuhMapProps {
  filteredKawasan: KawasanKumuh[];
  regionFilter: string;
  onKawasanSelect: (kawasan: KawasanKumuh) => void;
}

export interface KawasanKumuhMapRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

export const KawasanKumuhMap = forwardRef<KawasanKumuhMapRef, KawasanKumuhMapProps>(
  function KawasanKumuhMap({ filteredKawasan, regionFilter, onKawasanSelect }, ref) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    
    // STATE: Untuk memastikan peta sudah siap sebelum render marker
    const [isMapReady, setIsMapReady] = useState(false);

    // Expose flyTo method to parent
    useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number, zoom = 15) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], zoom, {
            animate: true,
            duration: 1.5,
            easeLinearity: 0.25,
          });
        }
      },
    }));

    // 1. INITIALIZE MAP (Hanya berjalan sekali saat mount)
    useEffect(() => {
      if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

      import("leaflet").then((L) => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Default view (Sumatera Utara)
        const regionData = kawasanRegionCenters["sumatera-utara"];

        const map = L.map(mapRef.current, {
          dragging: true,
          touchZoom: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          zoomControl: true,
          markerZoomAnimation: true,
        }).setView(
          [regionData.lat, regionData.lng],
          8 
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Fix layout issues
        setTimeout(() => { map.invalidateSize(); }, 100);
        setTimeout(() => { map.invalidateSize(); }, 500);

        map.on('click', (e) => {
          e.originalEvent?.stopPropagation();
        });

        mapInstanceRef.current = map;
        
        // TRIGGER: Beritahu komponen bahwa peta siap menerima marker
        setIsMapReady(true);
      });

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []); 

    // 2. RENDER MARKERS & HANDLE FILTER (Berjalan setiap kali data filter berubah)
    useEffect(() => {
      // PENTING: Jangan jalan jika peta belum siap!
      if (!isMapReady || !mapInstanceRef.current) return;

      import("leaflet").then((L) => {
        if (!mapInstanceRef.current) return;

        // Bersihkan marker lama
        mapInstanceRef.current.eachLayer((layer: L.Layer) => {
          if (layer instanceof L.Marker || layer instanceof L.Circle) {
            layer.remove();
          }
        });

        /* PERBAIKAN LOGIKA:
           Sebelumnya ada logika ternary yang memaksa menampilkan SEMUA data jika region="sumatera-utara".
           Ini dihapus agar filter (Status/Kelurahan) dari parent tetap berfungsi.
           Sekarang kita sepenuhnya bergantung pada props `filteredKawasan`.
        */
        const displayedKawasan = filteredKawasan;

        // Render marker baru berdasarkan hasil filter
        displayedKawasan.forEach((kawasan) => {
          if (!mapInstanceRef.current) return;

          const statusColor = kawasanStatusColors[kawasan.status];

          // Jitter agar marker tidak bertumpuk sempurna
          const jitterAmount = 0.0001;
          const jitteredLat = kawasan.lat + (Math.random() - 0.5) * jitterAmount;
          const jitteredLng = kawasan.lng + (Math.random() - 0.5) * jitterAmount;

          // Lingkaran Area
          L.circle([jitteredLat, jitteredLng], {
            color: statusColor.fill,
            fillColor: statusColor.fill,
            fillOpacity: 0.5,
            radius: kawasan.luas * 50,
          }).addTo(mapInstanceRef.current!);

          // Icon Marker Custom
          const icon = L.divIcon({
            className: "custom-marker",
            html: `<div style="
              width: 28px;
              height: 28px;
              background-color: ${statusColor.fill};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          // Marker dengan Popup Lengkap
          const marker = L.marker([jitteredLat, jitteredLng], { icon })
            .addTo(mapInstanceRef.current!)
            .bindPopup(
              `
              <div style="min-width: 250px; font-family: system-ui, sans-serif;">
                <div style="background: linear-gradient(135deg, ${statusColor.fill}, ${statusColor.fill}dd); color: white; padding: 12px 16px; margin: -8px -8px 12px -8px; border-radius: 4px 4px 0 0;">
                  <h3 style="font-weight: bold; font-size: 14px; margin: 0;">${kawasan.name}</h3>
                </div>
                <div style="padding: 0 8px 8px 8px; font-size: 12px; color: #64748b;">
                  <p style="margin-bottom: 8px;">
                    <strong style="color: #1e293b;">Lokasi:</strong> Kel. ${kawasan.kelurahan}, Kec. ${kawasan.kecamatan}, ${kawasan.kabupaten}
                  </p>
                  <p style="margin-bottom: 8px;">
                    <strong style="color: #1e293b;">Koordinat:</strong> ${kawasan.lat.toFixed(6)}, ${kawasan.lng.toFixed(6)}
                  </p>
                  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    <div><strong style="color: #1e293b;">Luas:</strong> ${kawasan.luas} Ha</div>
                    <div><strong style="color: #1e293b;">Jumlah KK:</strong> ${kawasan.kk}</div>
                    <div><strong style="color: #1e293b;">Tahun:</strong> ${kawasan.tahun}</div>
                    <div><strong style="color: #1e293b;">Legalitas:</strong> ${kawasan.legalitasLahan}</div>
                  </div>
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                    <div style="margin-bottom: 4px;"><strong style="color: #1e293b;">Kondisi Jalan:</strong> ${kawasan.kondisiJalan}</div>
                    <div style="margin-bottom: 4px;"><strong style="color: #1e293b;">Kondisi Drainase:</strong> ${kawasan.kondisiDrainase}</div>
                    <div><strong style="color: #1e293b;">Akses Air Minum:</strong> ${kawasan.aksesAirMinum}</div>
                  </div>
                </div>
              </div>
            `,
              { maxWidth: 350 }
            );

          marker.on("click", () => {
            onKawasanSelect(kawasan);
          });
        });

        // AUTO-FIT BOUNDS: Mengarahkan kamera ke marker yang tersisa
        if (displayedKawasan.length > 0) {
          mapInstanceRef.current!.invalidateSize();
          setTimeout(() => {
            if (!mapInstanceRef.current) return;
            const bounds = L.latLngBounds(
              displayedKawasan.map((k) => [k.lat, k.lng])
            );
            mapInstanceRef.current!.fitBounds(bounds, {
              padding: [50, 50],
              animate: true,
              duration: 1.5,
              maxZoom: 15, // Max zoom agar tidak terlalu dekat jika cuma 1 titik
            });
          }, 300);
        }
      });
    }, [filteredKawasan, isMapReady, onKawasanSelect]); // Dependency array lengkap

    return <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />;
  }
);