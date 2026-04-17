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

import { Home } from "lucide-react";

import {
  getVisibleAdminNavItems,
  isAdminNavChildActive,
  isAdminNavItemActive,
} from "@/components/admin/admin-sidebar-config";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useAdminAuth } from "./AdminAuthGuard";
import { AdminSidebarNavItem } from "./AdminSidebarNavItem";

interface AdminSidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

export function AdminSidebar({ collapsed, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const visibleItems = useMemo(
    () => getVisibleAdminNavItems(user.role),
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
          <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sidebar-border bg-white shadow-sm">
            <Image
              src="/logo-bp3kp.png"
              alt="Logo BP3KP"
              fill
              sizes="36px"
              className="object-contain p-1"
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
          const active = isAdminNavItemActive(pathname, item.href);
          const groupOpen =
            activeGroupHrefs.has(item.href) || Boolean(openGroups[item.href]);

          return (
            <AdminSidebarNavItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={active}
              groupOpen={groupOpen}
              onNavigate={onNavigate}
              onToggleGroup={(href) =>
                setOpenGroups((current) => ({
                  ...current,
                  [href]: !groupOpen,
                }))
              }
              isChildActive={(href) => isAdminNavChildActive(pathname, href)}
            />
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
