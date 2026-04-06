import { Suspense } from "react";

import { Activity, Shield, Users } from "lucide-react";

import {
  AdminExternalStatsSection,
  AdminExternalStatsSkeleton,
} from "@/components/admin/AdminExternalStatsSection";
import { StatsCard } from "@/components/admin/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUserFromCookies } from "@/lib/admin/security";
import { getDashboardOverview } from "@/lib/admin/service";
import { formatDateId } from "@/lib/date";

function formatRelativeTime(timestamp: string) {
  const now = Date.now();
  const diffMs = now - new Date(timestamp).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDateId(timestamp);
}

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

  const primaryCards = [
    {
      title: "Total Users",
      value: overview.stats.totalUsers,
      icon: <Users className="h-6 w-6" />,
      accent: "teal" as const,
    },
    {
      title: "Preview Halaman",
      value: overview.stats.usersLoaded,
      icon: <Shield className="h-6 w-6" />,
      accent: "gold" as const,
    },
    {
      title: "Aktivitas",
      value: overview.stats.totalRecordedActivities,
      icon: <Activity className="h-6 w-6" />,
      accent: "blue" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {primaryCards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
          />
        ))}
      </section>

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

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Aktivitas Terbaru
        </h2>

        <div className="grid gap-3 lg:grid-cols-2">
          {overview.recentActivities.length ? (
            overview.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-2xl border border-border/70 bg-background/70 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {activity.user} | {activity.module}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground lg:col-span-2">
              Belum ada aktivitas terbaru.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminOverviewDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <Skeleton className="mb-4 h-6 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid gap-3 lg:grid-cols-2">
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
