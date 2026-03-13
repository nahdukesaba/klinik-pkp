"use client";

import { useState, useCallback, useRef } from "react";

/** Lazy mount komponen saat masuk viewport via IntersectionObserver callback ref. */
export function useLazyMount(options: { rootMargin?: string } = {}) {
  const { rootMargin = "100px" } = options;
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      elementRef.current = node;
      if (isMounted || !node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setIsMounted(true);
            observer.disconnect();
            observerRef.current = null;
          }
        },
        {
          rootMargin,
          threshold: 0.01,
        }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [rootMargin, isMounted]
  );

  const reset = useCallback(() => {
    setIsMounted(false);
    setIsVisible(false);
  }, []);

  return {
    ref,
    isMounted,
    isVisible,
    reset,
  };
}
