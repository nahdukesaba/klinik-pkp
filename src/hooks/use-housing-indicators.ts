/**
 * useHousingIndicators Hook
 * 
 * Hook untuk mengakses data indikator kelayakan rumah.
 * Saat ini menggunakan data dummy, nanti bisa diganti fetch API.
 * 
 * Usage:
 * const { data, isLoading, error } = useHousingIndicators();
 * 
 * Untuk API nanti:
 * - Ubah return menjadi fetch dari endpoint
 * - Tambahkan loading state dan error handling
 */

import { useState, useEffect } from "react";

import { housingIndicatorsData, type HousingIndicator } from "@/data/housing-indicators";

interface UseHousingIndicatorsReturn {
  data: HousingIndicator[];
  isLoading: boolean;
  error: Error | null;
}

export function useHousingIndicators(): UseHousingIndicatorsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [_error, _setError] = useState<Error | null>(null);

  // Simulasi loading state untuk transisi ke API nanti
  useEffect(() => {
    setIsLoading(true);
    // Simulate minimal delay untuk UX consistency
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Ketika API sudah siap, ubah bagian ini menjadi:
   * 
   * const [data, setData] = useState<HousingIndicator[]>([]);
   * 
   * useEffect(() => {
   *   setIsLoading(true);
   *   fetch('/api/housing-indicators')
   *     .then(res => res.json())
   *     .then(data => {
   *       setData(data);
   *       setIsLoading(false);
   *     })
   *     .catch(err => {
   *       setError(err);
   *       setIsLoading(false);
   *     });
   * }, []);
   */

  return {
    data: housingIndicatorsData,
    isLoading,
    error: _error,
  };
}
