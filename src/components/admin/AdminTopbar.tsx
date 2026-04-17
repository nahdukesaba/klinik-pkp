/**
 * Admin Topbar — Header bar pada dashboard admin.
 *
 * Menampilkan breadcrumb, profil user real dari auth context, dan toggle tema.
 * Removed unnecessary search/notification buttons per user request.
 */

"use client";

import { useState } from "react";

import { usePathname } from "next/navigation";

import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Menu } from "lucide-react";

import { getAdminBreadcrumbs } from "@/components/admin/admin-topbar-breadcrumbs";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

import { useAdminAuth } from "./AdminAuthGuard";

interface AdminTopbarProps {
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  onMobileMenuToggle: () => void;
}

export function AdminTopbar({
  sidebarCollapsed,
  onSidebarToggle,
  onMobileMenuToggle,
}: AdminTopbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const [profileMenuState, setProfileMenuState] = useState<{
    open: boolean;
    pathname: string;
  }>({
    open: false,
    pathname,
  });
  const profileOpen =
    profileMenuState.pathname === pathname && profileMenuState.open;
  const breadcrumbs = getAdminBreadcrumbs(pathname);
  const currentPage = breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";

  const closeProfileMenu = () => {
    setProfileMenuState({
      pathname,
      open: false,
    });
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6",
        "bg-background/80 backdrop-blur-md border-b border-border",
        "transition-all duration-300",
        sidebarCollapsed ? "left-0 lg:left-[82px]" : "left-0 lg:left-[280px]",
        "right-0"
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-colors hover:bg-muted lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <button
          onClick={onSidebarToggle}
          className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-foreground/75 shadow-sm transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
          aria-label={sidebarCollapsed ? "Perluas sidebar" : "Kecilkan sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-muted-foreground/40">/</span>
              )}
              <span
                className={cn(
                  index === breadcrumbs.length - 1
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile - show only current page */}
        <h2 className="sm:hidden text-sm font-semibold text-foreground">
          {currentPage}
        </h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() =>
              setProfileMenuState((current) => ({
                pathname,
                open:
                  current.pathname === pathname
                    ? !current.open
                    : true,
              }))
            }
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase() ?? "A"}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {user?.name ?? "Admin"}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {user?.email ?? "admin@bp3kp.go.id"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
          </button>

          {/* Dropdown menu */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={closeProfileMenu}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-scale-in">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.name ?? "Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground break-all">
                    {user?.email ?? "admin@bp3kp.go.id"}
                  </p>
                  <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase">
                    {user?.role ?? "admin"}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      closeProfileMenu();
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
