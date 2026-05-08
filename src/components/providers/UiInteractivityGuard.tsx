"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

const DIALOG_OVERLAY_SELECTOR = "[data-ui-dialog-overlay]";
const DIALOG_CONTENT_SELECTOR = "[data-ui-dialog-content]";
const ROUTE_OVERLAY_SELECTOR = "[data-ui-route-overlay]";
const FOCUS_GUARD_SELECTOR = "[data-radix-focus-guard]";

function restoreBodyInteractivity() {
  if (typeof document === "undefined") {
    return;
  }

  document.body.style.removeProperty("pointer-events");
  document.body.style.removeProperty("overflow");
  document.documentElement.style.removeProperty("overflow");
  document.body.removeAttribute("data-scroll-locked");
}

function removeMatchedNodes(selector: string) {
  document.querySelectorAll(selector).forEach((node) => {
    node.remove();
  });
}

function hasOpenDialog() {
  return document.querySelector(
    `${DIALOG_CONTENT_SELECTOR}[data-state='open']`
  ) !== null;
}

function cleanupClosedDialogArtifacts() {
  if (typeof document === "undefined") {
    return;
  }

  removeMatchedNodes(
    `${DIALOG_OVERLAY_SELECTOR}[data-state='closed'], ${DIALOG_CONTENT_SELECTOR}[data-state='closed']`
  );

  if (!hasOpenDialog()) {
    window.requestAnimationFrame(() => {
      if (hasOpenDialog()) {
        return;
      }

      removeMatchedNodes(`${DIALOG_OVERLAY_SELECTOR}, ${DIALOG_CONTENT_SELECTOR}`);
      removeMatchedNodes(FOCUS_GUARD_SELECTOR);
      restoreBodyInteractivity();
    });
  }
}

function cleanupTransientLayersForRouteChange() {
  if (typeof document === "undefined") {
    return;
  }

  removeMatchedNodes(
    [
      DIALOG_OVERLAY_SELECTOR,
      DIALOG_CONTENT_SELECTOR,
      ROUTE_OVERLAY_SELECTOR,
      FOCUS_GUARD_SELECTOR,
    ].join(", ")
  );
  restoreBodyInteractivity();
}

export function UiInteractivityGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const timerIds = [0, 120, 240].map((delay) =>
      window.setTimeout(cleanupTransientLayersForRouteChange, delay)
    );
    const frameA = window.requestAnimationFrame(() => {
      cleanupTransientLayersForRouteChange();
      window.requestAnimationFrame(cleanupTransientLayersForRouteChange);
    });

    return () => {
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
      window.cancelAnimationFrame(frameA);
    };
  }, [pathname]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      cleanupClosedDialogArtifacts();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class", "data-state"],
    });

    const handlePageVisible = () => {
      if (document.visibilityState === "visible") {
        cleanupClosedDialogArtifacts();
      }
    };

    document.addEventListener("visibilitychange", handlePageVisible);
    window.addEventListener("pageshow", cleanupClosedDialogArtifacts);
    window.addEventListener("focus", cleanupClosedDialogArtifacts);
    cleanupClosedDialogArtifacts();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handlePageVisible);
      window.removeEventListener("pageshow", cleanupClosedDialogArtifacts);
      window.removeEventListener("focus", cleanupClosedDialogArtifacts);
    };
  }, []);

  return null;
}
