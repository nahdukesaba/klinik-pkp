"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  Gift,
  Home,
  Info,
  LogIn,
  MapPin,
  Menu,
  Palette,
  X,
} from "lucide-react";

import ThemeToggle from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

/** Cek apakah URL merupakan link eksternal */
function isExternalUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

interface SubMenuItem {
  label: string;
  href?: string;
  subItems?: { label: string; href: string }[];
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Kondisi Perumahan",
    icon: <Home className="w-4 h-4" />,
    subItems: [
      {
        label: "Sebaran Rusun",
        href: "/sebaran-rusun",
      },
      {
        label: "Profil Kawasan Kumuh",
        href: "/kawasan-kumuh",
      },
    ],
  },
  {
    label: "Bank Desain",
    icon: <Palette className="w-4 h-4" />,
    href: "/bank-desain",
  },
  {
    label: "Sosialisasi",
    icon: <BookOpen className="w-4 h-4" />,
    href: "/sosialisasi-klinik-pkp",
  },
  {
    label: "Penerimaan BSPS",
    icon: <Gift className="w-4 h-4" />,
    href: "/penerimaan-bsps",
  },
  {
    label: "Informasi",
    icon: <Info className="w-4 h-4" />,
    subItems: [
      { label: "Tentang", href: "/informasi/tentang" },
      { label: "Kontak", href: "/informasi/kontak" },
      { label: "FAQ", href: "/informasi/faq" },
      { label: "Bahan Bangunan", href: "/informasi/bahan-bangunan" },
      { label: "Perizinan", href: "/informasi/perizinan" },
      { label: "Peraturan", href: "/informasi/peraturan" },
      { label: "Buku Saku FLPP", href: "https://djvend02-ops.github.io/buku-saku-flpp/" },
    ],
  },
];

interface DropdownMenuProps {
  item: MenuItem;
  isOpen: boolean;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function DropdownMenu({
  item,
  isOpen,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: DropdownMenuProps) {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary",
          isActive && "bg-primary/15 text-primary font-semibold"
        )}
      >
        {item.icon}
        <span className="break-words leading-snug">{item.label}</span>
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => {
        onMouseLeave();
        setActiveSubMenu(null);
      }}
    >
      <button
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary",
          (isOpen || isActive) && "bg-primary/15 text-primary font-semibold"
        )}
      >
        {item.icon}
        <span className="break-words leading-snug">{item.label}</span>
        {item.subItems && (
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {isOpen && item.subItems && (
        <div className="absolute top-full left-0 pt-2 z-50 animate-fade-in">
          <div className="w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-border bg-card py-2 shadow-xl">
            {item.subItems.map((subItem, idx) => (
              <div
                key={idx}
                className="relative"
                onMouseEnter={() =>
                  subItem.subItems && setActiveSubMenu(subItem.label)
                }
                onMouseLeave={() =>
                  !subItem.subItems && setActiveSubMenu(null)
                }
              >
                {subItem.href ? (
                  isExternalUrl(subItem.href) ? (
                    <a
                      href={subItem.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="min-w-0 break-words leading-snug">
                        {subItem.label}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    </a>
                  ) : (
                    <Link
                      href={subItem.href}
                      className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="min-w-0 break-words leading-snug">
                        {subItem.label}
                      </span>
                    </Link>
                  )
                ) : (
                  <div className="flex cursor-pointer items-start justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                    <span className="min-w-0 break-words leading-snug">
                      {subItem.label}
                    </span>
                    {subItem.subItems && (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 -rotate-90" />
                    )}
                  </div>
                )}

                {activeSubMenu === subItem.label && subItem.subItems && (
                  <div className="absolute left-full top-0 ml-1 z-50 animate-fade-in">
                    <div className="w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-border bg-card py-2 shadow-xl">
                      {subItem.subItems.map((nestedItem, nestedIdx) => (
                        <Link
                          key={nestedIdx}
                          href={nestedItem.href}
                          className="flex items-start gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                          <span className="break-words leading-snug">
                            {nestedItem.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MobileMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  onClose: () => void;
}

function MobileMenuItem({ item, onClose, isActive }: MobileMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          "flex items-start gap-3 rounded-lg px-4 py-3 text-left text-base font-medium transition-colors hover:bg-accent",
          isActive && "bg-primary/15 text-primary font-semibold"
        )}
      >
        {item.icon}
        <span className="break-words leading-snug">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex w-full items-start justify-between rounded-lg px-4 py-3 text-left text-base font-medium transition-colors hover:bg-accent",
          isActive && "bg-primary/15 text-primary font-semibold"
        )}
      >
        <div className="flex items-start gap-3">
          {item.icon}
          <span className="break-words leading-snug">{item.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && item.subItems && (
        <div className="pl-6 space-y-1">
          {item.subItems.map((subItem, idx) =>
            subItem.href ? (
              isExternalUrl(subItem.href) ? (
                <a
                  key={idx}
                  href={subItem.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-start justify-between gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="min-w-0 break-words leading-snug">
                    {subItem.label}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                </a>
              ) : (
                <Link
                  key={idx}
                  href={subItem.href}
                  onClick={onClose}
                  className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  {subItem.label}
                </Link>
              )
            ) : (
              <MobileSubMenuItem
                key={idx}
                subItem={subItem}
                onClose={onClose}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

interface MobileSubMenuItemProps {
  subItem: SubMenuItem;
  onClose: () => void;
}

function MobileSubMenuItem({ subItem, onClose }: MobileSubMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-start justify-between rounded-lg px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <span className="break-words leading-snug">{subItem.label}</span>
        {subItem.subItems && (
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </button>

      {isExpanded && subItem.subItems && (
        <div className="pl-4 space-y-1 mt-1">
          {subItem.subItems.map((nestedItem, idx) => (
            <Link
              key={idx}
              href={nestedItem.href}
              onClick={onClose}
              className="flex items-start gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
              <span className="break-words leading-snug">{nestedItem.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Cek apakah menu item atau sub-item-nya aktif
  const isMenuActive = (item: MenuItem): boolean => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(item.href + "/");
    }
    if (item.subItems) {
      return item.subItems.some((subItem) => {
        if (subItem.href) {
          return pathname === subItem.href || pathname.startsWith(subItem.href + "/");
        }
        if (subItem.subItems) {
          return subItem.subItems.some(
            (nested) => pathname === nested.href || pathname.startsWith(nested.href + "/")
          );
        }
        return false;
      });
    }
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-white flex-shrink-0">
              <Image
                src="/logo-bp3kp.png"
                alt="Logo BP3KP Sumatera II"
                width={56}
                height={56}
                className="object-contain w-full h-full"
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
              <DropdownMenu
                key={item.label}
                item={item}
                isOpen={openMenu === item.label}
                isActive={isMenuActive(item)}
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-accent rounded-lg transition-colors"
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
                isActive={isMenuActive(item)}
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
