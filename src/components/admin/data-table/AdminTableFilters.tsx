"use client";

import type { ReactNode } from "react";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface AdminFilterSelect {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface AdminTableFiltersProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  selects?: AdminFilterSelect[];
  extraFilters?: ReactNode;
  activeFilterCount?: number;
  onReset?: () => void;
  actions?: ReactNode;
  className?: string;
}

const SEARCHABLE_SELECT_THRESHOLD = 10;

function hasSelectValue(select: AdminFilterSelect) {
  return select.value !== "" && select.value !== "all";
}

function AdminTableFilterSelect({ select }: { select: AdminFilterSelect }) {
  const placeholder = select.placeholder ?? select.label;

  if (select.options.length > SEARCHABLE_SELECT_THRESHOLD) {
    return (
      <div className="min-w-0 space-y-1 sm:w-52">
        <label className="text-xs font-medium text-muted-foreground">
          {select.label}
        </label>
        <SearchableSelect
          value={select.value}
          onValueChange={select.onChange}
          options={select.options}
          placeholder={placeholder}
          searchPlaceholder={`Cari ${select.label.toLowerCase()}...`}
          disabled={select.disabled}
          allOptionLabel={placeholder}
          showAllOption={false}
          className="bg-background"
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-1 sm:w-52">
      <label className="text-xs font-medium text-muted-foreground">
        {select.label}
      </label>
      <Select
        value={select.value}
        onValueChange={select.onChange}
        disabled={select.disabled}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-popover z-[9999]">
          {select.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AdminTableFilters({
  searchValue = "",
  searchPlaceholder = "Cari...",
  onSearchChange,
  selects = [],
  extraFilters,
  activeFilterCount,
  onReset,
  actions,
  className,
}: AdminTableFiltersProps) {
  const hasSearch = searchValue.trim().length > 0;
  const hasFilters = selects.some(hasSelectValue);
  const showReset = Boolean(
    onReset && (hasSearch || hasFilters || (activeFilterCount ?? 0) > 0)
  );

  if (!onSearchChange && selects.length === 0 && !extraFilters && !actions) {
    return null;
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(14rem,24rem)_repeat(auto-fit,minmax(12rem,13rem))] sm:items-end">
          {onSearchChange ? (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Pencarian
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="min-h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          ) : null}

          {selects.map((select) => (
            <AdminTableFilterSelect key={select.key} select={select} />
          ))}

          {extraFilters}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {showReset ? (
            <Button type="button" variant="outline" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          ) : null}
          {actions}
        </div>
      </div>
    </section>
  );
}
