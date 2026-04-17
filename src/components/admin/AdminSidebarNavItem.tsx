"use client";

import Link from "next/link";

import { ChevronDown } from "lucide-react";

import type { AdminNavItem } from "@/components/admin/admin-sidebar-config";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AdminSidebarNavItemProps {
  item: AdminNavItem;
  collapsed: boolean;
  active: boolean;
  groupOpen: boolean;
  onNavigate?: () => void;
  onToggleGroup: (href: string) => void;
  isChildActive: (href: string) => boolean;
}

export function AdminSidebarNavItem({
  item,
  collapsed,
  active,
  groupOpen,
  onNavigate,
  onToggleGroup,
  isChildActive,
}: AdminSidebarNavItemProps) {
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
