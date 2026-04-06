/**
 * Admin Sidebar — Navigasi utama dashboard admin.
 *
 * Fokus pada modul penting. Modul yang punya CRUD menampilkan dropdown aksi
 * langsung di item navigasi agar alur tambah data lebih cepat dan tidak terpisah.
 */

"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Building2,
  ChevronDown,
  HandCoins,
  Home,
  LayoutDashboard,
  Map,
  MapPin,
  Palette,
  Users,
} from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ADMIN_CONTENT_ROLES,
  ADMIN_ONLY_ROLES,
  canAccessAdminRole,
} from "@/lib/admin/roles";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/admin";

import { useAdminAuth } from "./AdminAuthGuard";

interface NavChild {
  label: string;
  href: string;
  roles?: readonly UserRole[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: readonly UserRole[];
  children?: NavChild[];
}

const navItems: NavItem[] = [
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
      { label: "Tambah BSPS", href: "/admin/bsps?create=1", roles: ADMIN_CONTENT_ROLES },
    ],
  },
  {
    label: "Sebaran Rusun",
    href: "/admin/rusun",
    icon: <Building2 className="h-5 w-5" />,
    children: [
      { label: "Data Rusun", href: "/admin/rusun" },
      { label: "Tambah Rusun", href: "/admin/rusun?create=1", roles: ADMIN_CONTENT_ROLES },
    ],
  },
  {
    label: "Kawasan Kumuh",
    href: "/admin/kawasan-kumuh",
    icon: <Map className="h-5 w-5" />,
    children: [
      { label: "Data Kawasan", href: "/admin/kawasan-kumuh" },
      { label: "Tambah Kawasan", href: "/admin/kawasan-kumuh?create=1", roles: ADMIN_CONTENT_ROLES },
    ],
  },
  {
    label: "Bank Desain",
    href: "/admin/bank-desain",
    icon: <Palette className="h-5 w-5" />,
    children: [
      { label: "Data Desain", href: "/admin/bank-desain" },
      { label: "Tambah Desain", href: "/admin/bank-desain?create=1", roles: ADMIN_CONTENT_ROLES },
    ],
  },
  {
    label: "Control Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    roles: ADMIN_ONLY_ROLES,
    children: [
      { label: "Data Pengguna", href: "/admin/users" },
      { label: "Tambah User", href: "/admin/users?create=1", roles: ADMIN_ONLY_ROLES },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

export function AdminSidebar({ collapsed, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const visibleItems = useMemo(
    () =>
      navItems
        .filter((item) => canAccessAdminRole(user.role, item.roles))
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) =>
            canAccessAdminRole(user.role, child.roles)
          ),
        })),
    [user.role]
  );
  const activeGroupHrefs = useMemo(
    () =>
      new Set(
        visibleItems
          .filter((item) => item.children?.length && pathname.startsWith(item.href))
          .map((item) => item.href)
      ),
    [pathname, visibleItems]
  );

  const isActive = (href: string) => {
    const pathnameOnly = href.split("?")[0];

    if (pathnameOnly === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(pathnameOnly);
  };

  const isChildActive = (href: string) => {
    if (href.includes("?")) {
      return false;
    }

    const pathnameOnly = href.split("?")[0];
    return pathname === pathnameOnly || pathname.startsWith(`${pathnameOnly}/`);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[82px]" : "w-[280px]"
      )}
    >
      <div className="border-b border-sidebar-border px-4 py-4">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sidebar-border bg-white shadow-sm">
            <Image
              src="/logo-bp3kp.png"
              alt="Logo BP3KP"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-semibold leading-tight text-sidebar-foreground break-words">
                BP3KP Admin
              </h1>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          const hasChildren = !collapsed && Boolean(item.children?.length);
          const groupOpen = activeGroupHrefs.has(item.href) || Boolean(openGroups[item.href]);

          const navLink = (
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex rounded-2xl text-sm font-medium transition-all duration-200",
                collapsed
                  ? "justify-center px-0 py-3"
                  : "min-w-0 items-center gap-3 px-3 py-3",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/72 hover:bg-sidebar-accent/55 hover:text-sidebar-foreground"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0",
                  active ? "text-sidebar-primary" : "text-current"
                )}
              >
                {item.icon}
              </span>

              {!collapsed && <span className="break-words leading-snug">{item.label}</span>}

              {active && (
                <div className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
              )}
            </Link>
          );

          return (
            <div key={item.href} className="space-y-1">
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">{navLink}</div>
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroups((current) => ({
                          ...current,
                          [item.href]: !groupOpen,
                        }))
                      }
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/55 hover:text-sidebar-foreground"
                      aria-label={`Buka menu ${item.label}`}
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", groupOpen && "rotate-180")}
                      />
                    </button>
                  )}
                </div>
              )}

              {hasChildren && groupOpen && (
                <div className="ml-5 space-y-1 border-l border-sidebar-border/70 pl-4">
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded-xl px-3 py-2 text-sm transition-colors",
                        isChildActive(child.href)
                          ? "bg-sidebar-accent/70 text-sidebar-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                onClick={onNavigate}
                className="flex h-12 items-center justify-center rounded-2xl text-sidebar-foreground/72 transition-colors hover:bg-sidebar-accent/55 hover:text-sidebar-foreground"
              >
                <Home className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Kembali ke Situs</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-sidebar-foreground/72 transition-colors hover:bg-sidebar-accent/55 hover:text-sidebar-foreground"
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            <span>Kembali ke Situs</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
