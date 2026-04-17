import { Search } from "lucide-react";

interface AdminDataTableToolbarProps {
  showSearch: boolean;
  searchPlaceholder: string;
  searchValue: string;
  headerActions?: React.ReactNode;
  onSearchChange: (value: string) => void;
}

export function AdminDataTableToolbar({
  showSearch,
  searchPlaceholder,
  searchValue,
  headerActions,
  onSearchChange,
}: AdminDataTableToolbarProps) {
  if (!showSearch && !headerActions) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
      {showSearch && (
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      )}
      {headerActions && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {headerActions}
        </div>
      )}
    </div>
  );
}
