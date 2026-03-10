"use client";

/**
 * Hook: useDebounce
 * 
 * Debounce hook untuk menunda perubahan nilai.
 * Berguna untuk input pencarian agar tidak memicu re-render/filter
 * terlalu sering saat user sedang mengetik.
 * 
 * @param value - Nilai yang akan di-debounce
 * @param delay - Delay dalam milidetik (default: 300ms)
 * @returns Nilai yang sudah di-debounce
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState("");
 * const debouncedSearch = useDebounce(searchQuery, 300);
 * 
 * // Gunakan debouncedSearch untuk filter, bukan searchQuery
 * const filteredItems = useMemo(() => {
 *   return items.filter(item => 
 *     item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
 *   );
 * }, [debouncedSearch]);
 */

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout untuk update nilai setelah delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timeout jika value berubah sebelum delay selesai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
