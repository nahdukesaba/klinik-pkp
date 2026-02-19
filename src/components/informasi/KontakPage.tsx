"use client";

import { useCallback } from "react";

import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function KontakPage() {
  const ref = useScrollAnimation();

  const handlePhoneClick = useCallback(() => {
    window.location.href = "tel:+6282246960231";
  }, []);

  const handleEmailClick = useCallback(() => {
    window.location.href = "mailto:klinikpkpsumateraii@gmail.com";
  }, []);

  const handleWhatsAppClick = useCallback(() => {
    window.open("https://wa.me/6282246960231", "_blank");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pt-24 pb-16">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent-2/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <MessageSquare className="w-4 h-4" />
              <span>Kontak</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Hubungi Kami
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Tim kami siap membantu Anda dengan pertanyaan seputar perumahan
              dan kawasan permukiman.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Phone Card */}
            <button
              onClick={handlePhoneClick}
              className="bg-card rounded-2xl border border-border p-8 shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all animate-on-scroll group text-left"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-primary-foreground mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-foreground text-xl mb-2">
                Telepon
              </h3>
              <p className="text-primary font-semibold text-lg mb-2 break-all">
                (061) 80033120
              </p>
              <p className="text-muted-foreground text-sm">
                Senin - Jumat, 08:00 - 16:00 WIB
              </p>
              <div className="mt-4 text-primary text-sm font-medium group-hover:underline">
                Klik untuk menelepon →
              </div>
            </button>

            {/* Email Card */}
            <button
              onClick={handleEmailClick}
              className="bg-card rounded-2xl border border-border p-8 shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all animate-on-scroll group text-left"
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-foreground text-xl mb-2">Email</h3>
              <p className="text-primary font-semibold text-sm sm:text-base md:text-lg mb-2 break-all">
                klinikpkpsumateraii@gmail.com
              </p>
              <p className="text-muted-foreground text-sm">
                Respon dalam 1-2 hari kerja
              </p>
              <div className="mt-4 text-primary text-sm font-medium group-hover:underline">
                Klik untuk mengirim email →
              </div>
            </button>

            {/* WhatsApp Card */}
            <button
              onClick={handleWhatsAppClick}
              className="bg-card rounded-2xl border border-border p-8 shadow-lg hover:shadow-2xl hover:border-green-500/30 transition-all animate-on-scroll group text-left"
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground text-xl mb-2">
                WhatsApp
              </h3>
              <p className="text-green-500 font-semibold text-lg mb-2 break-all">
                082246960231
              </p>
              <p className="text-muted-foreground text-sm">
                Chat langsung dengan tim kami
              </p>
              <div className="mt-4 text-green-500 text-sm font-medium group-hover:underline">
                Klik untuk chat WhatsApp →
              </div>
            </button>
          </div>

          {/* Address Section */}
          <div
            className="mt-16 max-w-2xl mx-auto text-center animate-on-scroll"
            style={{ transitionDelay: "0.3s" }}
          >
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-primary-foreground mx-auto mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-foreground text-xl mb-2">
                Alamat Kantor BP3KP
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base mb-4 max-w-md mx-auto leading-relaxed">
                Jalan Suluh No. 99, Kel. Sidorejo Hilir, Kec. Medan Tembung, 20222, Kota Medan, Prov. Sumatera Utara
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=3.5952,98.6722"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                Lihat di Google Maps →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
