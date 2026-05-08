"use client";

import type { ReactNode } from "react";

import {
  Building2,
  HandCoins,
  HelpCircle,
  LayoutDashboard,
  Map,
  MapPin,
  Palette,
  Users,
} from "lucide-react";

import {
  ADMIN_CONTENT_ROLES,
  ADMIN_ONLY_ROLES,
  canAccessAdminRole,
} from "@/lib/admin/roles";
import type { UserRole } from "@/types/admin";

export interface AdminNavChild {
  label: string;
  href: string;
  roles?: readonly UserRole[];
}

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles?: readonly UserRole[];
  children?: AdminNavChild[];
}

const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Sosialisasi",
    href: "/admin/sosialisasi",
    icon: <MapPin className="h-5 w-5" />,
    children: [
      { label: "Info Peta", href: "/admin/sosialisasi/lokasi" },
      { label: "Jadwal Kegiatan", href: "/admin/sosialisasi/jadwal" },
      { label: "Berita Sosialisasi", href: "/admin/sosialisasi/berita" },
    ],
  },
  {
    label: "Penerimaan BSPS",
    href: "/admin/bsps",
    icon: <HandCoins className="h-5 w-5" />,
    children: [
      { label: "Data BSPS", href: "/admin/bsps" },
      {
        label: "Tambah BSPS",
        href: "/admin/bsps?create=1",
        roles: ADMIN_CONTENT_ROLES,
      },
    ],
  },
  {
    label: "Sebaran Rusun",
    href: "/admin/rusun",
    icon: <Building2 className="h-5 w-5" />,
    children: [
      { label: "Data Rusun", href: "/admin/rusun" },
      {
        label: "Tambah Rusun",
        href: "/admin/rusun?create=1",
        roles: ADMIN_CONTENT_ROLES,
      },
    ],
  },
  {
    label: "Kawasan Kumuh",
    href: "/admin/kawasan-kumuh",
    icon: <Map className="h-5 w-5" />,
    children: [
      { label: "Data Kawasan", href: "/admin/kawasan-kumuh" },
      {
        label: "Tambah Kawasan",
        href: "/admin/kawasan-kumuh?create=1",
        roles: ADMIN_CONTENT_ROLES,
      },
    ],
  },
  {
    label: "Bank Desain",
    href: "/admin/bank-desain",
    icon: <Palette className="h-5 w-5" />,
    children: [
      { label: "Data Desain", href: "/admin/bank-desain" },
      {
        label: "Tambah Desain",
        href: "/admin/bank-desain?create=1",
        roles: ADMIN_CONTENT_ROLES,
      },
    ],
  },
  {
    label: "FAQ",
    href: "/admin/faq",
    icon: <HelpCircle className="h-5 w-5" />,
    children: [
      { label: "Daftar FAQ", href: "/admin/faq" },
      {
        label: "Tambah FAQ",
        href: "/admin/faq?create=1",
        roles: ADMIN_CONTENT_ROLES,
      },
    ],
  },
  {
    label: "Control Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    roles: ADMIN_ONLY_ROLES,
    children: [
      { label: "Data Pengguna", href: "/admin/users" },
      {
        label: "Tambah User",
        href: "/admin/users?create=1",
        roles: ADMIN_ONLY_ROLES,
      },
    ],
  },
];

export function getVisibleAdminNavItems(role: UserRole): AdminNavItem[] {
  return adminNavItems
    .filter((item) => canAccessAdminRole(role, item.roles))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) =>
        canAccessAdminRole(role, child.roles)
      ),
    }));
}

export function isAdminNavItemActive(pathname: string, href: string): boolean {
  const pathnameOnly = href.split("?")[0];

  if (pathnameOnly === "/admin") {
    return pathname === "/admin";
  }

  return pathname.startsWith(pathnameOnly);
}

export function isAdminNavChildActive(pathname: string, href: string): boolean {
  if (href.includes("?")) {
    return false;
  }

  const pathnameOnly = href.split("?")[0];
  return pathname === pathnameOnly || pathname.startsWith(`${pathnameOnly}/`);
}
