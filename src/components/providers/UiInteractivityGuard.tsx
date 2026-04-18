"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

function hasOpenDialog() {
  return Boolean(document.querySelector('[role="dialog"][data-state="open"]'));
}

function restoreBodyInteractivity() {
  if (typeof document === "undefined" || hasOpenDialog()) {
    return;
  }

  document.body.style.removeProperty("pointer-events");
}

export function UiInteractivityGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      restoreBodyInteractivity();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        restoreBodyInteractivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
