/**
 * Admin Shell — Layout wrapper untuk sidebar + topbar + content area.
 *
 * Mengelola state collapsed sidebar dan mobile menu overlay.
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((current) => !current);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden animate-fade-in"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar — desktop: follows collapsed state; mobile: off-screen toggle */}
      <div
        className={cn(
          "lg:block",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onNavigate={closeMobileMenu}
        />
      </div>

      {/* Topbar */}
      <AdminTopbar
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={toggleSidebar}
        onMobileMenuToggle={toggleMobileMenu}
      />

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:pl-[82px]" : "lg:pl-[280px]"
        )}
      >
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
