"use client";

import type { ReactNode } from "react";

import {
  BookOpen,
  Gift,
  Home,
  Info,
  Palette,
} from "lucide-react";

export interface NestedMenuItem {
  label: string;
  href: string;
}

export interface SubMenuItem {
  label: string;
  href?: string;
  subItems?: NestedMenuItem[];
}

export interface MenuItem {
  label: string;
  icon: ReactNode;
  href?: string;
  subItems?: SubMenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: "Kondisi Perumahan",
    icon: <Home className="h-4 w-4" />,
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
    icon: <Palette className="h-4 w-4" />,
    href: "/bank-desain",
  },
  {
    label: "Sosialisasi",
    icon: <BookOpen className="h-4 w-4" />,
    href: "/sosialisasi-klinik-pkp",
  },
  {
    label: "Penerimaan BSPS",
    icon: <Gift className="h-4 w-4" />,
    href: "/penerimaan-bsps",
  },
  {
    label: "Informasi",
    icon: <Info className="h-4 w-4" />,
    subItems: [
      { label: "Tentang", href: "/informasi/tentang" },
      { label: "Kontak", href: "/informasi/kontak" },
      { label: "FAQ", href: "/informasi/faq" },
      { label: "Bahan Bangunan", href: "/informasi/bahan-bangunan" },
      { label: "Perizinan", href: "/informasi/perizinan" },
      { label: "Peraturan", href: "/informasi/peraturan" },
      {
        label: "Buku Saku FLPP",
        href: "https://djvend02-ops.github.io/buku-saku-flpp/",
      },
    ],
  },
];

export function isExternalUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function isPathMatch(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isMenuItemActive(pathname: string, item: MenuItem): boolean {
  if (item.href) {
    return isPathMatch(pathname, item.href);
  }

  return (
    item.subItems?.some((subItem) => {
      if (subItem.href) {
        return isPathMatch(pathname, subItem.href);
      }

      return subItem.subItems?.some((nestedItem) =>
        isPathMatch(pathname, nestedItem.href)
      );
    }) ?? false
  );
}
