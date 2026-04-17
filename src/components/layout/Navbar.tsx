"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogIn, Menu, X } from "lucide-react";

import {
  isMenuItemActive,
  menuItems,
} from "@/components/layout/navbar-config";
import {
  DesktopMenuItem,
  MobileMenuItem,
} from "@/components/layout/navbar-menu";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-white flex-shrink-0">
              <Image
                src="/logo-bp3kp.png"
                alt="Logo BP3KP Sumatera II"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-medium uppercase tracking-wider leading-tight">
                BP3KP Sumatera II
              </p>
              <h1 className="text-xs sm:text-sm lg:text-base font-bold text-foreground leading-tight">
                Klinik PKP
              </h1>
            </div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden lg:flex items-center gap-1 pl-8">
            {menuItems.map((item) => (
              <DesktopMenuItem
                key={item.label}
                item={item}
                isOpen={openMenu === item.label}
                isActive={isMenuItemActive(pathname, item)}
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              />
            ))}
          </div>

          {/* Tombol CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/informasi/kontak"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg"
            >
              Hubungi Kami
            </Link>
            <Link
              href="/login"
              className="p-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors border border-border ml-2"
              title="Login"
            >
              <LogIn className="w-5 h-5" />
            </Link>
          </div>

          {/* Tombol Menu Mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-accent rounded-lg transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
              }
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-card border-b border-border shadow-xl animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <MobileMenuItem
                key={item.label}
                item={item}
                isActive={isMenuItemActive(pathname, item)}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            ))}
            <div className="pt-4 border-t border-border">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/informasi/kontak"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-3 bg-primary text-primary-foreground text-center font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Hubungi Kami
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-border bg-secondary p-3 text-secondary-foreground transition-colors hover:bg-secondary/80"
                  title="Login"
                >
                  <LogIn className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
