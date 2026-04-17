import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Inbox,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { Column, TableAction } from "./types";

interface AdminDataTableDesktopProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T>[];
  keyField: string;
  activePage: number;
  emptyMessage: string;
  sortKey: string | null;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  renderCellValue: (item: T, column: Column<T>) => React.ReactNode;
}

export function AdminDataTableDesktop<T extends object>({
  columns,
  data,
  actions,
  keyField,
  activePage,
  emptyMessage,
  sortKey,
  sortDir,
  onSort,
  renderCellValue,
}: AdminDataTableDesktopProps<T>) {
  const hasActions = Boolean(actions?.length);

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  column.sortable &&
                    "cursor-pointer select-none transition-colors hover:text-foreground",
                  column.className
                )}
                onClick={() => column.sortable && onSort(column.key)}
              >
                <div className="flex items-center gap-1.5">
                  {column.label}
                  {column.sortable && (
                    <span className="flex flex-col">
                      {sortKey === column.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {hasActions && (
              <th className="w-[200px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="px-4 py-16 text-center"
              >
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Inbox className="h-12 w-12 opacity-30" />
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const rowKey = String(
                (item as Record<string, unknown>)[keyField] ?? `${activePage}-${index}`
              );

              return (
                <tr key={rowKey} className="transition-colors hover:bg-muted/20">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-4 py-3.5 text-foreground", column.className)}
                    >
                      {renderCellValue(item, column)}
                    </td>
                  ))}

                  {hasActions && (
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap justify-end gap-2">
                        {actions?.map((action) => (
                          <button
                            key={`${rowKey}-${action.label}`}
                            type="button"
                            onClick={() => action.onClick(item)}
                            className={cn(
                              "inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
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
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
