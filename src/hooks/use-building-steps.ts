/**
 * useBuildingSteps Hook
 * 
 * Hook untuk mengakses data tahapan pembangunan.
 * Saat ini menggunakan data dummy, nanti bisa diganti fetch API.
 */

import { useState, useEffect } from "react";

import { buildingStepsData, type BuildingStep } from "@/data/building-steps";

interface UseBuildingStepsReturn {
  data: BuildingStep[];
  isLoading: boolean;
  error: Error | null;
}

export function useBuildingSteps(): UseBuildingStepsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [_error, _setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Ketika API sudah siap, ubah bagian ini menjadi fetch dari endpoint
   */

  return {
    data: buildingStepsData,
    isLoading,
    error: _error,
  };
}
