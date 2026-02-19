"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useLazyMount Hook
 * 
 * Hook untuk lazy mounting komponen berdasarkan visibility.
 * Komponen akan dimount ketika masuk viewport dan tetap mounted setelahnya.
 * 
 * Berguna untuk performance optimization pada komponen berat seperti peta.
 * 
 * @param options Configuration options
 * @param options.rootMargin Margin around the root for intersection detection
 * @returns Object dengan ref untuk target element, status mounted, dan visibility
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
  const ref = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setIsMounted(true);
          // Once mounted, we can disconnect the observer
          observer.disconnect();
        }
      },
      {
        rootMargin: rootMargin, // Start loading 100px before visible
        threshold: 0.01, // Trigger when even 1% is visible
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

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

export default useLazyMount;
