const DEFAULT_MIN_YEAR = 1900;
const DEFAULT_MAX_YEAR = 2100;

export interface YearOptionsResponse {
  years?: unknown[];
}

export function normalizeYearOption(
  value: unknown,
  options: { minYear?: number; maxYear?: number } = {}
) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : NaN;

  const minYear = options.minYear ?? DEFAULT_MIN_YEAR;
  const maxYear = options.maxYear ?? DEFAULT_MAX_YEAR;

  return Number.isFinite(parsed) && parsed >= minYear && parsed <= maxYear
    ? Math.trunc(parsed)
    : 0;
}

export function normalizeYearOptions(
  years: unknown,
  fallbackYears: readonly number[],
  options?: { minYear?: number; maxYear?: number }
) {
  if (!Array.isArray(years)) {
    return [...fallbackYears];
  }

  const normalizedYears = [...new Set(years)]
    .map((year) => normalizeYearOption(year, options))
    .filter((year) => year > 0)
    .sort((left, right) => right - left);

  return normalizedYears.length > 0 ? normalizedYears : [...fallbackYears];
}
