import type { ReactNode } from "react";

import type { Column } from "@/components/admin";
import type { SosialisasiLocation } from "@/services/sosialisasi.service";

export type SosialisasiAdminView = "lokasi" | "jadwal" | "berita";

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface ViewMetric {
  label: string;
  value: number;
}

export interface SosialisasiViewConfig {
  title: string;
  addLabel: string;
  dialogTitle: string;
  searchPlaceholder: string;
  emptyMessage: string;
  searchFields: string[];
  columns: Column<SosialisasiLocation>[];
  data: SosialisasiLocation[];
  stats: ViewMetric[];
  icon: ReactNode;
}
