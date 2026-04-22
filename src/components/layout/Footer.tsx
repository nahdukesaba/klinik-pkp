import Image from "next/image";
import Link from "next/link";

import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { klinikData } from "@/content/lokasi-klinik";
import { INFO_LINKS, QUICK_LINKS } from "@/lib/constants";
import { buildTelHref } from "@/lib/contact";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const weekdayHours = klinikData.operationalHours
    .filter((item) => !item.hours.toLowerCase().includes("tutup"))
    .map((item) => `${item.day} ${item.hours}`)
    .join(", ");

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
                <Image
                  src="/logo-bp3kp.png"
                  alt="Logo BP3KP Sumatera II"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Layanan</h4>
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

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Informasi</h4>
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
                      <ExternalLink className="h-3 w-3" />
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

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Kontak</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${klinikData.email}`}
                  className="flex items-start gap-3 break-words text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{klinikData.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={buildTelHref(klinikData.phone)}
                  className="flex items-start gap-3 break-words text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{klinikData.phone}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{klinikData.address}</span>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{weekdayHours}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              (c) {currentYear} Klinik PKP BP3KP Sumatera II
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
