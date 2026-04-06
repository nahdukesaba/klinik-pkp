import Image from "next/image";
import Link from "next/link";

import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { klinikData } from "@/content/lokasi-klinik";
import { INFO_LINKS, QUICK_LINKS } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const phoneHref = klinikData.phone.replace(/[^\d+]/g, "");
  const weekdayHours = klinikData.operationalHours
    .filter((item) => !item.hours.toLowerCase().includes("tutup"))
    .map((item) => `${item.day} ${item.hours}`)
    .join(", ");

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Bagian Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-white">
                <Image
                  src="/logo-bp3kp.png"
                  alt="Logo BP3KP Sumatera II"
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  BP3KP Sumatera II
                </p>
                <h3 className="text-lg font-bold text-foreground">
                  Klinik PKP
                </h3>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Layanan informasi perumahan dan permukiman di wilayah Sumatera II.
            </p>
          </div>

          {/* Tautan Cepat */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Layanan</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="break-words text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tautan Informasi */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Informasi</h4>
            <ul className="space-y-3">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1 break-words text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="break-words text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Info Kontak */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${klinikData.email}`}
                  className="flex items-start gap-3 break-words text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{klinikData.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phoneHref}`}
                  className="flex items-start gap-3 break-words text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{klinikData.phone}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{klinikData.address}</span>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{weekdayHours}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bar Bawah */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © {currentYear} Klinik PKP BP3KP Sumatera II
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
              <Link
                href="/informasi/kebijakan-privasi"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Kebijakan Privasi
              </Link>
              <Link
                href="/informasi/syarat-ketentuan"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
