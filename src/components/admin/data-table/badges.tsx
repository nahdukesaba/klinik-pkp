import { Edit, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

import type { TableAction } from "./types";

const statusVariants: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  inactive: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  suspended: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  draft: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  archived: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  selesai: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  proses: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rencana: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  mendatang: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

const statusLabels: Record<string, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  suspended: "Ditangguhkan",
  published: "Dipublikasi",
  draft: "Draf",
  archived: "Diarsipkan",
  selesai: "Selesai",
  proses: "Dalam Proses",
  rencana: "Rencana",
  mendatang: "Mendatang",
  pending: "Pending Dokumentasi",
};

const roleVariants: Record<string, string> = {
  admin: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  user: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = statusVariants[status] || "bg-muted text-muted-foreground";
  const label = statusLabels[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variant
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          status === "active" || status === "published" || status === "selesai"
            ? "bg-emerald-500"
            : status === "inactive" || status === "archived"
              ? "bg-gray-400"
              : status === "suspended"
                ? "bg-rose-500"
                : status === "draft" || status === "proses" || status === "pending"
                  ? "bg-amber-500"
                  : "bg-blue-500"
        )}
      />
      {label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const variant = roleVariants[role] || "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        variant
      )}
    >
      {role}
    </span>
  );
}

export function editAction<T>(
  onClick: (item: T) => void,
  options: Pick<TableAction<T>, "isVisible" | "isDisabled" | "disabledReason"> = {}
): TableAction<T> {
  return {
    label: "Edit",
    icon: <Edit className="h-4 w-4" />,
    onClick,
    ...options,
  };
}

export function deleteAction<T>(
  onClick: (item: T) => void,
  options: Pick<TableAction<T>, "isVisible" | "isDisabled" | "disabledReason"> = {}
): TableAction<T> {
  return {
    label: "Hapus",
    icon: <Trash2 className="h-4 w-4" />,
    onClick,
    variant: "destructive",
    ...options,
  };
}
