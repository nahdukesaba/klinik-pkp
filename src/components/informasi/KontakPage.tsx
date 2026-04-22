"use client";

import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { klinikData } from "@/content/lokasi-klinik";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { buildWhatsAppUrl } from "@/lib/contact";

const whatsappHref = buildWhatsAppUrl(
  klinikData.phone,
  "Halo Klinik PKP, saya ingin menghubungi tim Klinik PKP."
);

export default function KontakPage() {
  const ref = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pt-24 pb-16">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-accent-2/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mb-16 text-center animate-on-scroll">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <MessageSquare className="h-4 w-4" />
              <span>Kontak</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Hubungi Kami
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Tim kami siap membantu Anda dengan pertanyaan seputar perumahan
              dan kawasan permukiman.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <a
              href="tel:+6282246960231"
              className="group animate-on-scroll rounded-2xl border border-border bg-card p-8 text-left shadow-lg transition-all hover:border-primary/30 hover:shadow-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground transition-transform group-hover:scale-110">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Telepon</h3>
              <p className="mb-2 break-all text-lg font-semibold text-primary">
                (061) 80033120
              </p>
              <p className="text-sm text-muted-foreground">
                Senin - Jumat, 08:00 - 16:00 WIB
              </p>
              <div className="mt-4 text-sm font-medium text-primary group-hover:underline">
                Klik untuk menelepon -&gt;
              </div>
            </a>

            <a
              href={`mailto:${klinikData.email}`}
              className="group animate-on-scroll rounded-2xl border border-border bg-card p-8 text-left shadow-lg transition-all hover:border-primary/30 hover:shadow-2xl"
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary text-primary-foreground transition-transform group-hover:scale-110">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Email</h3>
              <p className="mb-2 break-all text-sm font-semibold text-primary sm:text-base md:text-lg">
                {klinikData.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Respon dalam 1-2 hari kerja
              </p>
              <div className="mt-4 text-sm font-medium text-primary group-hover:underline">
                Klik untuk mengirim email -&gt;
              </div>
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group animate-on-scroll rounded-2xl border border-border bg-card p-8 text-left shadow-lg transition-all hover:border-green-500/30 hover:shadow-2xl"
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white transition-transform group-hover:scale-110">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                WhatsApp
              </h3>
              <p className="mb-2 break-all text-lg font-semibold text-green-500">
                {klinikData.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                Chat langsung dengan tim kami
              </p>
              <div className="mt-4 text-sm font-medium text-green-500 group-hover:underline">
                Klik untuk chat WhatsApp -&gt;
              </div>
            </a>
          </div>

          <div
            className="mx-auto mt-16 max-w-2xl text-center animate-on-scroll"
            style={{ transitionDelay: "0.3s" }}
          >
            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Alamat Kantor BP3KP
              </h3>
              <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Jalan Suluh No. 99, Kel. Sidorejo Hilir, Kec. Medan Tembung,
                20222, Kota Medan, Prov. Sumatera Utara
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=3.5952,98.6722"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
              >
                Lihat di Google Maps -&gt;
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
