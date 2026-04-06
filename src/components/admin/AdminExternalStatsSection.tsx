import {
  AlertTriangle,
  Building2,
  HandCoins,
  Map,
  MapPin,
  Palette,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getExternalDashboardStats } from "@/lib/admin/external-stats";

const moduleCards = [
  {
    key: "totalBsps",
    label: "BSPS",
    icon: <HandCoins className="h-4 w-4" />,
  },
  {
    key: "totalRusun",
    label: "Rusun",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    key: "totalKumuh",
    label: "Kawasan Kumuh",
    icon: <Map className="h-4 w-4" />,
  },
  {
    key: "totalBankDesain",
    label: "Bank Desain",
    icon: <Palette className="h-4 w-4" />,
  },
  {
    key: "totalSosialisasi",
    label: "Sosialisasi",
    icon: <MapPin className="h-4 w-4" />,
  },
] as const;

export async function AdminExternalStatsSection() {
  const summary = await getExternalDashboardStats();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Modul Dinamis</h2>

      {summary.failedResources.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Sebagian statistik belum terbaca: {summary.failedResources.join(", ")}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {moduleCards.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {item.icon}
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {summary[item.key].toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdminExternalStatsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
    </section>
  );
}
