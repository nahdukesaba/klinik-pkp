/**
 * Filter Utilities
 * 
 * Utility functions untuk filtering dan searching data.
 */

/**
 * Generic search filter - case insensitive
 */
export function searchFilter<T>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query.trim()) return items;
  
  const lowerQuery = query.toLowerCase();
  
  return items.filter((item) => {
    return fields.some((field) => {
      const value = item[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
  });
}

/**
 * Filter by single field value
 */
export function filterByField<T, K extends keyof T>(
  items: T[],
  field: K,
  value: T[K] | "all"
): T[] {
  if (value === "all") return items;
  return items.filter((item) => item[field] === value);
}

/**
 * Combined filter - apply multiple filters at once
 */
export function applyFilters<T>(
  items: T[],
  filters: Array<{
    field: keyof T;
    value: unknown;
    allValue?: unknown;
  }>
): T[] {
  return filters.reduce((result, { field, value, allValue = "all" }) => {
    if (value === allValue) return result;
    return result.filter((item) => item[field] === value);
  }, items);
}

/**
 * Get unique values from array field
 */
export function getUniqueValues<T, K extends keyof T>(
  items: T[],
  field: K
): T[K][] {
  const values = items.map((item) => item[field]);
  return [...new Set(values)];
}

/**
 * Sort items by field
 */
export function sortByField<T, K extends keyof T>(
  items: T[],
  field: K,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc" 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });
}

/**
 * Paginate items
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; totalPages: number; currentPage: number } {
  const totalPages = Math.ceil(items.length / pageSize);
  const currentPage = Math.min(Math.max(1, page), totalPages || 1);
  const startIndex = (currentPage - 1) * pageSize;
  
  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalPages,
    currentPage,
  };
}
