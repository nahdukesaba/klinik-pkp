"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

import {
  logoutAdminSession,
  refreshAdminSession,
} from "@/services/auth.service";
import type { UserRole } from "@/types/admin";

export interface AdminAuthUser {
  id: string;
  name: string;
  email: string;
  nip: string;
  role: UserRole;
  accessTokenExpiresAt?: number;
}

interface AdminAuthContextType {
  user: AdminAuthUser;
  logout: () => Promise<void>;
  refreshSession: (options?: { force?: boolean }) => Promise<boolean>;
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
  const sessionLifetimeMs = 15 * 60 * 1000;
  const inactivityTimeoutMs = 5 * 60 * 1000;
  const activityWindowMs = inactivityTimeoutMs;
  const refreshBufferMs = 2 * 60 * 1000;
  const refreshCooldownMs = 60_000;
  const lastActivityAtRef = useRef(Date.now());
  const lastRefreshAtRef = useRef(0);
  const refreshInFlightRef = useRef(false);
  const expiresAtRef = useRef(
    user.accessTokenExpiresAt ?? Date.now() + sessionLifetimeMs
  );
  const logoutPath = useMemo(() => "/login", []);

  const logout = useCallback(async () => {
    try {
      await logoutAdminSession();
    } finally {
      window.location.replace(logoutPath);
    }
  }, [logoutPath]);

  const refreshSession = useCallback(
    async (options?: { force?: boolean }) => {
      if (refreshInFlightRef.current) {
        return false;
      }

      const now = Date.now();
      const remainingMs = expiresAtRef.current - now;
      const isVisible =
        typeof document === "undefined" ||
        document.visibilityState === "visible";
      const isActiveRecently =
        now - lastActivityAtRef.current < activityWindowMs;
      const refreshedRecently =
        now - lastRefreshAtRef.current < refreshCooldownMs;

      const tokenStillFresh = remainingMs > refreshBufferMs;
      const shouldBypassCooldown = Boolean(options?.force) && remainingMs <= 0;

      if (
        !isVisible ||
        !isActiveRecently ||
        tokenStillFresh ||
        (refreshedRecently && !shouldBypassCooldown)
      ) {
        return true;
      }

      refreshInFlightRef.current = true;

      try {
        const refreshResult = await refreshAdminSession();

        if (refreshResult.ok) {
          lastRefreshAtRef.current = Date.now();
          expiresAtRef.current =
            refreshResult.accessTokenExpiresAt ?? Date.now() + sessionLifetimeMs;
          return true;
        }

        if (refreshResult.status === 401) {
          await logout();
        }

        return false;
      } catch {
        return false;
      } finally {
        refreshInFlightRef.current = false;
      }
    },
    [activityWindowMs, logout, refreshBufferMs, refreshCooldownMs, sessionLifetimeMs]
  );

  useEffect(() => {
    expiresAtRef.current =
      user.accessTokenExpiresAt ?? Date.now() + sessionLifetimeMs;
  }, [sessionLifetimeMs, user.accessTokenExpiresAt]);

  useEffect(() => {
    let logoutInFlight = false;

    const markActivity = () => {
      lastActivityAtRef.current = Date.now();
    };

    const logoutIfInactive = () => {
      if (
        logoutInFlight ||
        Date.now() - lastActivityAtRef.current < inactivityTimeoutMs
      ) {
        return;
      }

      logoutInFlight = true;
      void logout();
    };

    const handleActivity = () => {
      logoutIfInactive();
      if (!logoutInFlight) {
        markActivity();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        logoutIfInactive();
        if (logoutInFlight) {
          return;
        }

        markActivity();
        void refreshSession();
      }
    };

    const handleFocus = () => {
      logoutIfInactive();
      if (logoutInFlight) {
        return;
      }

      markActivity();
      void refreshSession();
    };

    const intervalId = window.setInterval(() => {
      logoutIfInactive();
      if (logoutInFlight) {
        return;
      }

      void refreshSession();
    }, 30_000);

    window.addEventListener("pointerdown", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity, { passive: true });
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [inactivityTimeoutMs, logout, refreshSession]);

  return (
    <AdminAuthContext.Provider value={{ user, logout, refreshSession }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
