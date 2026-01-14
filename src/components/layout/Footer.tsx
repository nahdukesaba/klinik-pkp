import Image from "next/image";
import Link from "next/link";

import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { INFO_LINKS, QUICK_LINKS } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
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
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pusat layanan dan informasi mengenai perumahan dan kawasan
              permukiman di wilayah Sumatera II.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Layanan</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Informasi</h4>
            <ul className="space-y-3">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:bp3kp.sumateraii@pu.go.id"
                  className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>bp3kp.sumateraii@pu.go.id</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+62618003312"
                  className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>(061) 80033120</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Jl. Suluh No.99, Sidorejo Hilir, Kec. Medan Tembung, Kota Medan, Sumatera Utara 20222
                  </span>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Senin - Jumat: 08:00 - 16:00 WIB</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Klinik PKP BP3KP Sumatera II. Hak Cipta
              Dilindungi.
            </p>
            <div className="flex items-center gap-6">
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
