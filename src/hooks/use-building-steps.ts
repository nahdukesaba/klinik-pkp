/**
 * useBuildingSteps Hook
 * 
 * Hook untuk mengakses data tahapan pembangunan.
 * Data statis - siap untuk diganti fetch API jika diperlukan.
 */

import { buildingStepsData, type BuildingStep } from "@/data/building-steps";

export function useBuildingSteps(): BuildingStep[] {
  return buildingStepsData;
}
