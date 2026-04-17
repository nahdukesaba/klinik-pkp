import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

import type { Column, TableAction } from "./types";

interface AdminDataTableMobileCardsProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  activePage: number;
  emptyMessage: string;
  actions?: TableAction<T>[];
  renderCellValue: (item: T, column: Column<T>) => React.ReactNode;
}

export function AdminDataTableMobileCards<T extends object>({
  columns,
  data,
  keyField,
  activePage,
  emptyMessage,
  actions,
  renderCellValue,
}: AdminDataTableMobileCardsProps<T>) {
  const hasActions = Boolean(actions?.length);

  return (
    <div className="space-y-3 p-3 md:hidden">
      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-10 text-center text-muted-foreground">
          <Inbox className="h-10 w-10 opacity-30" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        data.map((item, index) => {
          const rowKey = String(
            (item as Record<string, unknown>)[keyField] ?? `${activePage}-${index}`
          );

          return (
            <article
              key={rowKey}
              className="space-y-3 rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
            >
              {columns.map((column) => (
                <div key={column.key} className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {column.label}
                  </p>
                  <div className="min-w-0 break-words text-sm text-foreground">
                    {renderCellValue(item, column)}
                  </div>
                </div>
              ))}

              {hasActions && (
                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  {actions?.map((action, actionIndex) => (
                    <button
                      key={`${rowKey}-${action.label}-${actionIndex}`}
                      type="button"
                      onClick={() => action.onClick(item)}
                      className={cn(
                        "inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                        action.variant === "destructive"
                          ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      )}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
