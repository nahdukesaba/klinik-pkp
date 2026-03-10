"use client";

import { useState, useCallback, useRef } from "react";

/**
 * useLazyMount Hook
 *
 * Hook untuk lazy mounting komponen berdasarkan visibility.
 * Komponen akan dimount ketika masuk viewport dan tetap mounted setelahnya.
 *
 * Menggunakan **callback ref** sehingga observer otomatis di-setup
 * ketika element masuk DOM — aman digunakan bersama conditional rendering
 * (misalnya loading state yang men-delay render element).
 *
 * @param options Opsi konfigurasi
 * @param options.rootMargin Margin di sekitar root untuk deteksi intersection
 * @returns Object dengan ref callback untuk target element, status mounted, dan visibility
 *
 * @example
 * ```tsx
 * const { ref, isMounted, isVisible } = useLazyMount();
 *
 * return (
 *   <div ref={ref}>
 *     {isMounted && <HeavyComponent />}
 *   </div>
 * );
 * ```
 */
export function useLazyMount(options: { rootMargin?: string } = {}) {
  const { rootMargin = "100px" } = options;
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  // Callback ref: dipanggil setiap kali element di-attach/detach dari DOM.
  // Ini menyelesaikan masalah early-return conditional rendering:
  // observer akan di-setup begitu element benar-benar ada di DOM.
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      // Bersihkan observer lama
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      elementRef.current = node;

      // Kalau sudah mounted, tidak perlu observe lagi
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
