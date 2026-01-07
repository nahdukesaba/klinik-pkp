/**
 * FilterSelect Component
 * 
 * Reusable filter dropdown component.
 * Wrapper di atas Select untuk styling dan usage konsisten.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: FilterOption[];
  allOption?: { value: string; label: string };
  className?: string;
}

export function FilterSelect({
  value,
  onValueChange,
  placeholder = "Pilih filter",
  options,
  allOption,
  className = "",
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allOption && (
          <SelectItem value={allOption.value}>{allOption.label}</SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * YearFilter - preset untuk filter tahun
 */
interface YearFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  years: number[];
  className?: string;
}

export function YearFilter({
  value,
  onValueChange,
  years,
  className = "w-32",
}: YearFilterProps) {
  return (
    <FilterSelect
      value={value}
      onValueChange={onValueChange}
      placeholder="Tahun"
      options={years.map((y) => ({ value: y.toString(), label: y.toString() }))}
      allOption={{ value: "all", label: "Semua Tahun" }}
      className={className}
    />
  );
}

/**
 * MonthFilter - preset untuk filter bulan
 */
interface MonthFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const months = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export function MonthFilter({
  value,
  onValueChange,
  className = "w-36",
}: MonthFilterProps) {
  return (
    <FilterSelect
      value={value}
      onValueChange={onValueChange}
      placeholder="Bulan"
      options={months}
      allOption={{ value: "all", label: "Semua Bulan" }}
      className={className}
    />
  );
}

/**
 * StatusFilter - preset untuk filter status
 */
interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  statuses: Array<{ value: string; label: string }>;
  className?: string;
}

export function StatusFilter({
  value,
  onValueChange,
  statuses,
  className = "w-40",
}: StatusFilterProps) {
  return (
    <FilterSelect
      value={value}
      onValueChange={onValueChange}
      placeholder="Status"
      options={statuses}
      allOption={{ value: "all", label: "Semua Status" }}
      className={className}
    />
  );
}
