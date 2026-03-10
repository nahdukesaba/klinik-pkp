"use client";

import { useEffect, useRef, useCallback } from "react";

import Image from "next/image";

import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { MapSkeleton } from "@/components/ui/skeleton";
import { klinikData } from "@/content/lokasi-klinik";
import { useLazyMount } from "@/hooks/use-lazy-mount";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { loadLeaflet, destroyMap, cleanupMapContainer, buildSafePopup } from "@/lib/map-utils";
import { escapeAttr } from "@/lib/security";

/**
 * Lokasi Klinik Page Component
 * 
 * Halaman untuk menampilkan lokasi dan informasi kontak Klinik PKP.
 * Menggunakan Leaflet untuk peta interaktif.
 * 
 * @component
 */
export default function LokasiKlinikPage() {
  const ref = useScrollAnimation();
  const mapLazy = useLazyMount();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const openInMaps = useCallback(() => {
    const [lat, lng] = klinikData.coordinates;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  }, []);

  useEffect(() => {
    if (!mapLazy.isMounted) return;
    if (typeof window === "undefined" || !mapRef.current) return;

    // Prevent re-initialization if already initialized
    cleanupMapContainer(mapRef.current);

    let resizeObserver: ResizeObserver | undefined;

    loadLeaflet().then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: klinikData.coordinates,
        zoom: 15,
        zoomControl: true,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Add radius circle
      L.circle(klinikData.coordinates, {
        radius: 300,
        color: "hsl(191, 79%, 25%)",
        fillColor: "hsl(191, 79%, 25%)",
        fillOpacity: 0.2,
        weight: 3,
      }).addTo(map);

      // Smaller inner circle for center point
      L.circle(klinikData.coordinates, {
        radius: 50,
        color: "hsl(191, 79%, 25%)",
        fillColor: "hsl(191, 79%, 35%)",
        fillOpacity: 0.6,
        weight: 2,
      }).addTo(map);

      // Build XSS-safe popup with klinik image
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${klinikData.coordinates[0]},${klinikData.coordinates[1]}`;
      const popupContent = buildSafePopup({
        title: klinikData.name,
        headerColor: "hsl(191, 79%, 25%)",
        imageUrl: "/klinik.jpeg",
        imageAlt: "Gedung Klinik PKP BP3KP",
        fields: [
          { label: "Alamat", value: klinikData.address },
          { label: "Telepon", value: klinikData.phone },
        ],
        extraHtml: `
          <div style="margin-top: 8px;">
            <a href="${escapeAttr(mapsUrl)}" target="_blank" rel="noopener noreferrer" 
               style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 8px; background: hsl(191, 79%, 25%); color: #fff; text-decoration: none;">
              Buka di Google Maps
            </a>
          </div>
        `,
      });

      L.popup()
        .setLatLng(klinikData.coordinates)
        .setContent(popupContent)
        .openOn(map);

      // ResizeObserver to handle dynamic layout changes
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapRef.current!);

      // Force invalidateSize after mount for lazy-loaded containers
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 300);
      setTimeout(() => map.invalidateSize(), 800);
    });

    return () => {
      resizeObserver?.disconnect();
      destroyMap(mapInstanceRef.current);
      mapInstanceRef.current = null;
    };
  }, [mapLazy.isMounted]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pt-24 pb-16">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background to-accent-2/20 dark:from-background dark:via-background dark:to-primary/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <MapPin className="w-4 h-4" />
              <span>Lokasi Klinik</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Kunjungi Klinik PKP Kami
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Datang langsung ke kantor kami untuk konsultasi tatap muka dengan
              tim ahli perumahan dan kawasan permukiman.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Map Section */}
            <div ref={mapLazy.ref} className="space-y-6 animate-on-scroll">
              {mapLazy.isMounted ? (
                <div
                  ref={mapRef}
                  className="w-full h-[350px] md:h-[400px] lg:h-[450px] 2xl:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-border"
                />
              ) : (
                <MapSkeleton className="w-full h-[350px] md:h-[400px] lg:h-[450px] 2xl:h-[500px]" />
              )}

              {/* Open in Maps Button */}
              <button
                onClick={openInMaps}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                Buka Lokasi di Google Maps
              </button>

              {/* Building Image */}
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
                <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10">
                  <Image
                    src="/klinik.jpeg"
                    alt="Gedung Balai BP3KP Tampak Depan"
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-bold">Gedung Balai BP3KP</h3>
                    <p className="text-sm opacity-90">Tampak Depan Bangunan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="space-y-6">
              {/* Address Card */}
              <div className="p-6 bg-card rounded-2xl border border-border shadow-lg animate-on-scroll hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground flex-shrink-0">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-2">
                      Alamat
                    </h3>
                    <p className="text-muted-foreground">{klinikData.address}</p>
                  </div>
                </div>
              </div>

              {/* Operational Hours */}
              <div
                className="p-6 bg-card rounded-2xl border border-border shadow-lg animate-on-scroll hover:shadow-xl transition-shadow"
                style={{ transitionDelay: "0.1s" }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center text-primary-foreground flex-shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1">
                      Jam Operasional
                    </h3>
                  </div>
                </div>
                <div className="space-y-3 ml-[4.5rem]">
                  {klinikData.operationalHours.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-foreground font-medium">
                        {item.day}
                      </span>
                      <span
                        className={`text-sm ${item.hours.includes("Tutup")
                            ? "text-destructive"
                            : "text-primary font-semibold"
                          }`}
                      >
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Card */}
              <div
                className="p-6 bg-card rounded-2xl border border-border shadow-lg animate-on-scroll hover:shadow-xl transition-shadow"
                style={{ transitionDelay: "0.2s" }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground flex-shrink-0">
                    <Phone className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-2">
                      Kontak
                    </h3>
                  </div>
                </div>
                <div className="space-y-3 ml-[4.5rem]">
                  <a
                    href={`tel:${klinikData.phone}`}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{klinikData.phone}</span>
                  </a>
                  <a
                    href={`mailto:${klinikData.email}`}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{klinikData.email}</span>
                  </a>
                </div>
              </div>

              {/* Services Card */}
              <div
                className="p-6 bg-card rounded-2xl border border-border shadow-lg animate-on-scroll hover:shadow-xl transition-shadow"
                style={{ transitionDelay: "0.3s" }}
              >
                <h3 className="font-bold text-foreground text-lg mb-4">
                  Layanan Tersedia
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {klinikData.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
