import dynamic from "next/dynamic";

import { FaqPageSkeleton } from "@/components/shared";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Klinik PKP",
  description:
    "Daftar pertanyaan yang sering diajukan seputar layanan Klinik PKP, konsultasi, dan informasi perumahan serta kawasan permukiman.",
};

const FaqPage = dynamic(() => import("@/components/faq/FaqPage"), {
  loading: () => <FaqPageSkeleton />,
  ssr: true,
});

export default FaqPage;
