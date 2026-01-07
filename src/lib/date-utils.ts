/**
 * Date Utilities
 * 
 * Utility functions untuk formatting dan filtering tanggal.
 */

/**
 * Format date string ke format Indonesia
 */
export function formatDateIndonesia(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}

/**
 * Format date ke format short
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}

/**
 * Get year from date string
 */
export function getYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}

/**
 * Get month from date string (1-12)
 */
export function getMonth(dateString: string): number {
  return new Date(dateString).getMonth() + 1;
}

/**
 * Get month string padded (01-12)
 */
export function getMonthPadded(dateString: string): string {
  const month = getMonth(dateString);
  return month.toString().padStart(2, "0");
}

/**
 * Check if date is in range
 */
export function isDateInRange(
  dateString: string,
  startDate: string,
  endDate: string
): boolean {
  const date = new Date(dateString);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return date >= start && date <= end;
}

/**
 * Filter array by date range
 */
export function filterByDateRange<T extends { rawDate?: string; date?: string }>(
  items: T[],
  startDate: string,
  endDate: string
): T[] {
  if (!startDate || !endDate) return items;
  
  return items.filter((item) => {
    const dateField = item.rawDate || item.date;
    if (!dateField) return false;
    return isDateInRange(dateField, startDate, endDate);
  });
}

/**
 * Filter array by year
 */
export function filterByYear<T extends { rawDate?: string; date?: string }>(
  items: T[],
  year: string
): T[] {
  if (year === "all") return items;
  
  return items.filter((item) => {
    const dateField = item.rawDate || item.date;
    if (!dateField) return false;
    return getYear(dateField).toString() === year;
  });
}

/**
 * Filter array by month
 */
export function filterByMonth<T extends { rawDate?: string; date?: string }>(
  items: T[],
  month: string
): T[] {
  if (month === "all") return items;
  
  return items.filter((item) => {
    const dateField = item.rawDate || item.date;
    if (!dateField) return false;
    return getMonthPadded(dateField) === month;
  });
}

/**
 * Get unique years from array of items
 */
export function getUniqueYears<T extends { rawDate?: string; date?: string }>(
  items: T[]
): number[] {
  const years = items.map((item) => {
    const dateField = item.rawDate || item.date;
    return dateField ? getYear(dateField) : null;
  }).filter((y): y is number => y !== null);
  
  return [...new Set(years)].sort((a, b) => b - a);
}
