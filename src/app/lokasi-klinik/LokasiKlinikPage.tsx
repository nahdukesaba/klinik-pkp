"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";

import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { klinikData } from "@/data/lokasi-klinik";
import useScrollAnimation from "@/hooks/use-scroll-animation";

export default function LokasiKlinikPage() {
  const ref = useScrollAnimation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const openInMaps = () => {
    const [lat, lng] = klinikData.coordinates;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    
    const container = mapRef.current;
    
    // Prevent re-initialization if already initialized
    type LeafletContainer = HTMLDivElement & { _leaflet_id?: number };
    if ((container as LeafletContainer)._leaflet_id) {
      return;
    }

    import("leaflet").then((L) => {
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

      // Popup on center
      L.popup()
        .setLatLng(klinikData.coordinates)
        .setContent(
          `
        <div class="p-4 min-w-[280px]">
          <h3 class="font-bold text-lg text-gray-900 mb-2">${klinikData.name}</h3>
          <p class="text-sm text-gray-600 mb-3">${klinikData.address}</p>
          <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${klinikData.coordinates[0]},${klinikData.coordinates[1]}', '_blank')" class="w-full px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2" style="background: hsl(191, 79%, 25%)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Buka di Google Maps
          </button>
        </div>
      `
        )
        .openOn(map);
    });

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.warn("Error removing map:", err);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

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
            <div className="space-y-6 animate-on-scroll">
              <div
                ref={mapRef}
                className="w-full h-[350px] rounded-2xl overflow-hidden shadow-2xl border border-border"
              />

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
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop"
                    alt="Gedung Balai BP3KP Tampak Depan"
                    fill
                    className="object-cover"
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
                        className={`text-sm ${
                          item.hours.includes("Tutup")
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
