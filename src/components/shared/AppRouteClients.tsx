"use client";

import dynamic from "next/dynamic";

import {
  LokasiKlinikPageSkeleton,
  MapLazySectionSkeleton,
} from "./LoadingSkeletons";

export const KawasanKumuhRouteClient = dynamic(
  () => import("@/components/kawasan-kumuh/KawasanKumuhPage"),
  {
    loading: () => <MapLazySectionSkeleton />,
    ssr: false,
  }
);

export const LokasiKlinikRouteClient = dynamic(
  () => import("@/components/lokasi-klinik/LokasiKlinikPage"),
  {
    loading: () => <LokasiKlinikPageSkeleton />,
    ssr: false,
  }
);

export const PenerimaanBspsRouteClient = dynamic(
  () => import("@/components/penerimaan-bsps/PenerimaanBspsPage"),
  {
    loading: () => <MapLazySectionSkeleton />,
    ssr: false,
  }
);

export const SebaranRusunRouteClient = dynamic(
  () => import("@/components/sebaran-rusun/SebaranRusunPage"),
  {
    loading: () => (
      <MapLazySectionSkeleton sidebarCardHeights={["h-40", "h-64"]} />
    ),
    ssr: false,
  }
);
