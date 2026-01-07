import * as React from "react";

import { Input } from "@/components/ui/input";

interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FilterConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  disabled?: boolean;
}

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  onReset: () => void;
}

export const FilterSection = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filters,
  onReset,
}: FilterSectionProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-4"
          />
        </div>
      </div>

      {/* Filters */}
      {filters.map((filter) => (
        <div key={filter.label} className="w-full lg:w-48">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            disabled={filter.disabled}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors whitespace-nowrap"
      >
        Reset
      </button>
    </div>
  );
}