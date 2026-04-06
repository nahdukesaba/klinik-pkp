interface AdminStatsGridItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  tone?: string;
}

interface AdminStatsGridProps {
  items: AdminStatsGridItem[];
  columnsClassName?: string;
}

export function AdminStatsGrid({
  items,
  columnsClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
}: AdminStatsGridProps) {
  return (
    <section className={columnsClassName}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          {item.icon ? (
            <div
              className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                item.tone ?? "bg-primary/10 text-primary"
              }`}
            >
              {item.icon}
            </div>
          ) : null}
          <p className="text-2xl font-semibold text-foreground">{item.value}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {item.label}
          </p>
        </div>
      ))}
    </section>
  );
}
