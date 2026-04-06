"use client";

import * as React from "react";

import { Check, ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

// --- Types ---
export interface SearchableSelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectProps {
  /** Current selected value */
  value: string;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** List of options to display */
  options: SearchableSelectOption[];
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Text shown when no options match search */
  emptyText?: string;
  /** Additional className for trigger button */
  className?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** The "all" option label (e.g., "Semua Kabupaten") */
  allOptionLabel?: string;
  /** Whether to show the "all" option */
  showAllOption?: boolean;
}

// --- SearchableSelect Component ---
export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ditemukan",
  className,
  disabled = false,
  allOptionLabel = "Semua",
  showAllOption = true,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Get display label for current value
  const displayLabel = React.useMemo(() => {
    if (value === "all") return allOptionLabel;
    const option = options.find((opt) => opt.value === value);
    return option?.label || placeholder;
  }, [value, options, placeholder, allOptionLabel]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex min-h-10 w-full items-start justify-between gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:bg-accent/50 transition-colors",
          className
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={cn(
          "min-w-0 flex-1 break-words text-left whitespace-normal leading-tight",
          value === "all" ? "text-foreground/70" : "text-foreground"
        )}>
          {displayLabel}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] mt-1 w-full min-w-0 max-w-[min(24rem,calc(100vw-2rem))] rounded-md border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-8 pr-8 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[200px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {/* All Option */}
            {showAllOption && (
              <button
                type="button"
                onClick={() => handleSelect("all")}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none transition-colors",
                  value === "all"
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                >
                  <span className="flex-1 break-words text-left whitespace-normal leading-tight">
                    {allOptionLabel}
                  </span>
                  {value === "all" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
              </button>
            )}

            {/* Filtered Options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none transition-colors",
                    value === option.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <span className="flex-1 break-words text-left whitespace-normal leading-tight">
                    {option.label}
                  </span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper function to convert string array to options ---
export function stringsToOptions(strings: string[]): SearchableSelectOption[] {
  return strings
    .filter((s) => s !== "all" && s !== "Semua Lokasi") // Filter out "all" values
    .map((s) => ({
      value: s,
      label: s,
    }));
}
