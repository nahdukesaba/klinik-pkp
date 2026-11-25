"use client";

import { createElement, useEffect } from "react";

const SCRIPT_ID = "bp3kp-app-switcher-script";

function resolveDefaultSsoBaseUrl(): string {
  const configured = String(process.env.NEXT_PUBLIC_SSO_BASE_URL ?? "").trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith("bp3kpsumatera2.com")
  ) {
    return "https://sso.bp3kpsumatera2.com";
  }
  return "http://localhost:8082";
}

export function AppLauncher({
  ssoBaseUrl,
  currentApp = "klinik_pkp",
  align = "right",
  className,
}: {
  ssoBaseUrl?: string;
  currentApp?: string;
  align?: "left" | "right";
  className?: string;
}) {
  const cleanBase = (
    ssoBaseUrl ? ssoBaseUrl.trim() : resolveDefaultSsoBaseUrl()
  ).replace(/\/+$/, "");

  useEffect(() => {
    if (typeof window === "undefined" || !window.customElements) return;
    if (window.customElements.get("bp3kp-app-switcher")) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "/api/auth/widget";
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return createElement("bp3kp-app-switcher", {
    "sso-url": cleanBase,
    "current-app": currentApp,
    "apps-endpoint": "/api/auth/apps",
    align,
    ...(className ? { class: className } : {}),
  });
}
