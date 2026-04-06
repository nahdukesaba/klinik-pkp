interface AdminAccessDeniedProps {
  description: string;
  title?: string;
}

export function AdminAccessDenied({
  description,
  title = "Akses dibatasi",
}: AdminAccessDeniedProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
