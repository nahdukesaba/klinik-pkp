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
  const pathname = usePathname();

  return <NavbarContent key={pathname} pathname={pathname} />;
}

interface NavbarContentProps {
  pathname: string;
}

function NavbarContent({ pathname }: NavbarContentProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between lg:h-20">
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
          <div className="hidden items-center gap-1 pl-6 lg:flex xl:pl-8">
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
              className="ml-2 rounded-lg border border-border bg-secondary p-2.5 text-secondary-foreground transition-colors hover:bg-secondary/80"
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
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 transition-colors hover:bg-accent"
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
        <div className="absolute top-full left-0 right-0 max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-border bg-card shadow-xl animate-slide-up lg:hidden">
          <div className="container mx-auto space-y-2 px-4 py-4 sm:px-6">
            {menuItems.map((item) => (
              <MobileMenuItem
                key={item.label}
                item={item}
                isActive={isMenuItemActive(pathname, item)}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            ))}
            <div className="border-t border-border pt-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/informasi/kontak"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-primary py-3 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
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
