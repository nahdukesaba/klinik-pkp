import { Suspense } from "react";

import {
  AlertTriangle,
  Building2,
  HandCoins,
  HelpCircle,
  Map,
  MapPin,
  Palette,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getExternalDashboardStats } from "@/lib/admin/external-stats";
import { getSessionUserFromCookies } from "@/lib/admin/security";
import { getDashboardOverview } from "@/lib/admin/service";

const moduleCards = [
  {
    key: "totalFaqs",
    label: "FAQ",
    icon: <HelpCircle className="h-4 w-4" />,
  },
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

async function AdminOverviewDetails({
  role,
  backendAccessToken,
}: {
  role: string;
  backendAccessToken?: string;
}) {
  const overview = await getDashboardOverview({
    includeAudit: role === "admin",
    backendAccessToken,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Control Users</h2>

        <div className="grid gap-3">
          {overview.usersPreview.length > 0 ? (
            overview.usersPreview.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground break-words">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground break-all">
                    {item.email}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                    {item.role}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      item.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Belum ada data user.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

async function AdminExternalStatsSection() {
  const summary = await getExternalDashboardStats();
  const moduleSummaries = moduleCards.map((item) => ({
    ...item,
    summary: summary.modules.find((module) => module.key === item.key),
  }));

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Data Modul</h2>
      </div>

      {summary.failedResources.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Sebagian statistik belum terbaca: {summary.failedResources.join(", ")}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {moduleSummaries.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {(item.summary?.totalRecords ?? summary[item.key]).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminExternalStatsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
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

function AdminOverviewDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <Skeleton className="mb-4 h-6 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const user = await getSessionUserFromCookies();

  return (
    <div className="space-y-6 animate-fade-in">
      <Suspense fallback={<AdminExternalStatsSkeleton />}>
        <AdminExternalStatsSection />
      </Suspense>

      <Suspense fallback={<AdminOverviewDetailsSkeleton />}>
        <AdminOverviewDetails
          role={user?.role ?? "admin"}
          backendAccessToken={user?.backendAccessToken}
        />
      </Suspense>
    </div>
  );
}
