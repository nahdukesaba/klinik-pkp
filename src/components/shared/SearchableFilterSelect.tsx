/**
 * SearchableFilterSelect Component
 * 
 * Reusable wrapper for SearchableSelect specifically for location filters
 * Provides consistent styling and behavior across the application
 */

import { useMemo } from "react";

import { SearchableSelect, stringsToOptions } from "@/components/ui/searchable-select";

interface SearchableFilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  options: string[];
  allLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableFilterSelect({
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  options,
  allLabel = "Semua",
  className = "w-full h-9 text-xs",
  disabled = false,
}: SearchableFilterSelectProps) {
  const selectOptions = useMemo(() => stringsToOptions(options), [options]);

  return (
    <SearchableSelect
      value={value}
      onValueChange={onValueChange}
      options={selectOptions}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      allOptionLabel={allLabel}
      emptyText={`${placeholder} tidak ditemukan`}
      className={className}
      disabled={disabled}
    />
  );
}
