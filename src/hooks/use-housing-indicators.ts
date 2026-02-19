/**
 * useHousingIndicators Hook
 * 
 * Hook untuk mengakses data indikator kelayakan rumah.
 * Data statis - siap untuk diganti fetch API jika diperlukan.
 */

import { housingIndicatorsData, type HousingIndicator } from "@/data/housing-indicators";

export function useHousingIndicators(): HousingIndicator[] {
  return housingIndicatorsData;
}
