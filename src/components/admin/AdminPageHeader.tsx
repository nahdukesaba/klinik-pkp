"use client";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  createLabel?: string;
  onCreate?: () => void;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  icon,
  createLabel,
  onCreate,
  actions,
}: AdminPageHeaderProps) {
  const hasActions = Boolean((createLabel && onCreate) || actions);

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-foreground">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </span>
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {hasActions ? (
        <div className="flex flex-wrap items-center gap-3">
          {createLabel && onCreate ? (
            <Button onClick={onCreate} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              {createLabel}
            </Button>
          ) : null}

          {actions}
        </div>
      ) : null}
    </section>
  );
}
