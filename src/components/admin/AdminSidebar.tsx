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

import { ChevronDown, Home } from "lucide-react";

import {
  type AdminNavItem,
  getVisibleAdminNavItems,
  isAdminNavChildActive,
  isAdminNavItemActive,
} from "@/components/admin/admin-sidebar-config";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useAdminAuth } from "./AdminAuthGuard";

interface AdminSidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

function AdminSidebarNavItem({
  item,
  collapsed,
  active,
  groupOpen,
  onNavigate,
  onToggleGroup,
  isChildActive,
}: {
  item: AdminNavItem;
  collapsed: boolean;
  active: boolean;
  groupOpen: boolean;
  onNavigate?: () => void;
  onToggleGroup: (href: string) => void;
  isChildActive: (href: string) => boolean;
}) {
  const hasChildren = !collapsed && Boolean(item.children?.length);

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
    <div className="space-y-1">
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
              onClick={() => onToggleGroup(item.href)}
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
