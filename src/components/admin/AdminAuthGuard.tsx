"use client";

import { createContext, useContext } from "react";

import { useRouter } from "next/navigation";

import type { UserRole } from "@/types/admin";

export interface AdminAuthUser {
  id: string;
  name: string;
  email: string;
  nip: string;
  role: UserRole;
}

interface AdminAuthContextType {
  user: AdminAuthUser;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth harus digunakan di dalam AdminAuthProvider.");
  }

  return context;
}

interface AdminAuthProviderProps {
  user: AdminAuthUser;
  children: React.ReactNode;
}

export function AdminAuthProvider({
  user,
  children,
}: AdminAuthProviderProps) {
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
