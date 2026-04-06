/**
 * StatsCard - Kartu statistik ringkas untuk dashboard overview.
 */

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: "teal" | "gold" | "blue" | "green" | "red" | "purple";
  className?: string;
}

const accentStyles = {
  teal: {
    bg: "from-[hsl(191,79%,25%)] to-[hsl(195,85%,21%)]",
    iconBg: "bg-[hsl(191,79%,25%)]/15",
    iconColor: "text-[hsl(191,79%,25%)]",
    darkIconBg: "dark:bg-[hsl(191,70%,45%)]/15",
    darkIconColor: "dark:text-[hsl(191,70%,45%)]",
  },
  gold: {
    bg: "from-[hsl(47,46%,69%)] to-[hsl(45,42%,55%)]",
    iconBg: "bg-[hsl(47,46%,69%)]/20",
    iconColor: "text-[hsl(47,46%,45%)]",
    darkIconBg: "dark:bg-[hsl(47,40%,55%)]/20",
    darkIconColor: "dark:text-[hsl(47,40%,55%)]",
  },
  blue: {
    bg: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-600",
    darkIconBg: "dark:bg-blue-500/20",
    darkIconColor: "dark:text-blue-400",
  },
  green: {
    bg: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
    darkIconBg: "dark:bg-emerald-500/20",
    darkIconColor: "dark:text-emerald-400",
  },
  red: {
    bg: "from-rose-500 to-rose-600",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600",
    darkIconBg: "dark:bg-rose-500/20",
    darkIconColor: "dark:text-rose-400",
  },
  purple: {
    bg: "from-violet-500 to-violet-600",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600",
    darkIconBg: "dark:bg-violet-500/20",
    darkIconColor: "dark:text-violet-400",
  },
};

export function StatsCard({
  title,
  value,
  icon,
  accent = "teal",
  className,
}: StatsCardProps) {
  const style = accentStyles[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5",
        "transition-all duration-300 hover:border-primary/20 hover:shadow-lg",
        className
      )}
    >
      <div
        className={cn(
          "absolute left-0 right-0 top-0 h-1 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100",
          style.bg
        )}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {typeof value === "number" ? value.toLocaleString("id-ID") : value}
          </p>
        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            style.iconBg,
            style.darkIconBg
          )}
        >
          <span className={cn(style.iconColor, style.darkIconColor)}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
