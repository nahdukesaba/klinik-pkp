"use client";

import Link from "next/link";

import {
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { klinikData } from "@/content/lokasi-klinik.content";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { KONSULTASI_HREF } from "@/lib/constants";
import {
  WHATSAPP_MESSAGE_TEMPLATES,
  buildTelHref,
  buildWhatsAppUrl,
} from "@/lib/contact";

const whatsappHref = buildWhatsAppUrl(
  klinikData.phone,
  WHATSAPP_MESSAGE_TEMPLATES.general
);

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${klinikData.coordinates[0]},${klinikData.coordinates[1]}`;

export default function HubungiKamiPage() {
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
          <div className="mb-14 text-center animate-on-scroll">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <MessageSquare className="h-4 w-4" />
              <span>Hubungi Kami</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Kanal Kontak Klinik PKP
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Pilih kanal yang paling sesuai untuk menghubungi tim kami,
              meminta informasi, atau menindaklanjuti kebutuhan konsultasi.
            </p>
          </div>

          <div className="mx-auto mb-8 grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="animate-on-scroll rounded-3xl border border-border bg-card p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-foreground">
                Siap konsultasi?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Jika Anda memerlukan konsultasi terkait perumahan, bantuan
                teknis, atau arahan layanan, gunakan alur konsultasi agar tim
                kami dapat mengarahkan Anda ke kanal yang paling tepat.
              </p>
              <div className="mt-6">
                <Link
                  href={KONSULTASI_HREF}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  Buka Alur Konsultasi
                </Link>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group animate-on-scroll rounded-3xl border border-border bg-card p-8 shadow-lg transition-all hover:border-green-500/30 hover:shadow-2xl"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white transition-transform group-hover:scale-110">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">WhatsApp</h2>
              <p className="mt-2 break-all text-lg font-semibold text-green-600">
                {klinikData.phone}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Kanal tercepat untuk menghubungi tim Klinik PKP pada jam
                layanan aktif.
              </p>
            </a>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <a
              href={buildTelHref(klinikData.phone)}
              className="group animate-on-scroll rounded-3xl border border-border bg-card p-7 shadow-lg transition-all hover:border-primary/30 hover:shadow-2xl"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Phone className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Telepon</h2>
              <p className="mt-2 text-base font-semibold text-primary">
                {klinikData.phone}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Digunakan untuk komunikasi langsung pada hari dan jam layanan
                Klinik PKP.
              </p>
            </a>

            <a
              href={`mailto:${klinikData.email}`}
              className="group animate-on-scroll rounded-3xl border border-border bg-card p-7 shadow-lg transition-all hover:border-primary/30 hover:shadow-2xl"
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Mail className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Email</h2>
              <p className="mt-2 break-all text-base font-semibold text-primary">
                {klinikData.email}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Cocok untuk pertanyaan yang memerlukan lampiran, arsip, atau
                penjelasan lebih rinci.
              </p>
            </a>

            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group animate-on-scroll rounded-3xl border border-border bg-card p-7 shadow-lg transition-all hover:border-primary/30 hover:shadow-2xl"
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <MapPin className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Alamat</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {klinikData.address}
              </p>
              <p className="mt-3 text-sm font-semibold text-primary">
                Buka di Google Maps
              </p>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
