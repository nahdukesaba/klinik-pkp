import Link from "next/link";

import {
  ArrowUpRight,
  Building2,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { klinikData } from "@/content/lokasi-klinik.content";
import { HUBUNGI_KAMI_HREF } from "@/lib/constants";
import {
  WHATSAPP_MESSAGE_TEMPLATES,
  buildWhatsAppUrl,
} from "@/lib/contact";

const consultationWhatsAppHref = buildWhatsAppUrl(
  klinikData.phone,
  WHATSAPP_MESSAGE_TEMPLATES.consultation
);

const consultationSteps = [
  "Pilih kanal konsultasi yang paling sesuai dengan kebutuhan Anda.",
  "Sampaikan kebutuhan atau pertanyaan secara ringkas agar tim lebih cepat memahami konteks layanan.",
  "Tim Klinik PKP akan menindaklanjuti pada jam operasional yang berlaku.",
];

export default function KonsultasiPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/75 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent-2/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <MessagesSquare className="h-4 w-4" />
              <span>Konsultasi</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Pilih Cara Konsultasi dengan Klinik PKP
            </h1>
            <p className="text-lg text-muted-foreground">
              Kami sediakan alur singkat agar Anda dapat langsung menuju kanal
              konsultasi yang sesuai tanpa kehilangan konteks layanan.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <a
              href={consultationWhatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-3xl border border-border bg-card p-8 shadow-lg transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-green-500/10 p-3 text-green-600">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Konsultasi Online via WhatsApp
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Opsi tercepat untuk memulai percakapan dengan tim Klinik PKP.
                Tombol ini membuka WhatsApp dengan pesan awal yang sudah
                disiapkan agar konsultasi lebih terarah sejak awal.
              </p>
              <div className="mt-6 inline-flex items-center rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white">
                Mulai konsultasi online
              </div>
            </a>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary w-fit">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-foreground">
                Ingin datang langsung?
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Jika Anda memerlukan penjelasan tatap muka, detail kontak,
                alamat kantor, dan pilihan kanal lain tersedia di halaman
                Hubungi Kami.
              </p>
              <div className="mt-6">
                <Link
                  href={HUBUNGI_KAMI_HREF}
                  className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  Lihat Hubungi Kami
                </Link>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-border bg-card p-8 shadow-lg">
            <h2 className="text-xl font-bold text-foreground">
              Alur singkat konsultasi
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {consultationSteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-border bg-background/80 p-5"
                >
                  <span className="text-sm font-semibold text-primary">
                    0{index + 1}
                  </span>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
