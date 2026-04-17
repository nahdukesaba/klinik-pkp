export function getVisiblePageNumbers(
  totalPages: number,
  activePage: number
): number[] {
  return Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    if (totalPages <= 5) {
      return index + 1;
    }

    if (activePage <= 3) {
      return index + 1;
    }

    if (activePage >= totalPages - 2) {
      return totalPages - 4 + index;
    }

    return activePage - 2 + index;
  });
}

export function filterTableData<T extends object>(
  data: T[],
  searchQuery: string,
  searchFields: string[]
): T[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery || searchFields.length === 0) {
    return data;
  }

  return data.filter((item) =>
    searchFields.some((field) => {
      const value = (item as Record<string, unknown>)[field];

      if (typeof value === "string") {
        return value.toLowerCase().includes(normalizedQuery);
      }

      if (typeof value === "number") {
        return value.toString().includes(normalizedQuery);
      }

      return false;
    })
  );
}

export function sortTableData<T extends object>(
  data: T[],
  sortKey: string | null,
  sortDir: "asc" | "desc"
): T[] {
  if (!sortKey) {
    return data;
  }

  return [...data].sort((left, right) => {
    const leftValue = (left as Record<string, unknown>)[sortKey];
    const rightValue = (right as Record<string, unknown>)[sortKey];

    if (leftValue == null && rightValue == null) return 0;
    if (leftValue == null) return 1;
    if (rightValue == null) return -1;

    if (typeof leftValue === "string" && typeof rightValue === "string") {
      return sortDir === "asc"
        ? leftValue.localeCompare(rightValue)
        : rightValue.localeCompare(leftValue);
    }

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return sortDir === "asc"
        ? leftValue - rightValue
        : rightValue - leftValue;
    }

    return 0;
  });
}

export function paginateTableData<T>(
  data: T[],
  activePage: number,
  pageSize: number
): T[] {
  const start = (activePage - 1) * pageSize;
  return data.slice(start, start + pageSize);
}
