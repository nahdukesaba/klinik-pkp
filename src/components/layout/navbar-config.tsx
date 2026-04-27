import type { ReactNode } from "react";

import {
  BookOpenText,
  Home,
  Info,
  Palette,
} from "lucide-react";

import { INFO_LINKS } from "@/lib/constants";

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
    label: "Program PKP",
    icon: <Home className="h-4 w-4" />,
    subItems: [
      {
        label: "Sebaran Rusun",
        href: "/sebaran-rusun",
      },
      {
        label: "Kawasan Kumuh",
        href: "/kawasan-kumuh",
      },
      {
        label: "Penerimaan BSPS",
        href: "/penerimaan-bsps",
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
    icon: <BookOpenText className="h-4 w-4" />,
    href: "/sosialisasi-klinik-pkp",
  },
  {
    label: "Informasi",
    icon: <Info className="h-4 w-4" />,
    subItems: INFO_LINKS.map((link) => ({
      label: link.label,
      href: link.href,
    })),
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
