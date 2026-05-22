/**
 * Helper tanggal terpusat untuk aplikasi Klinik PKP.
 *
 * Semua tampilan publik menggunakan zona waktu Indonesia Barat agar konsisten
 * antara admin, backend, dan pengguna publik.
 */

export const APP_TIME_ZONE = "Asia/Jakarta";

const defaultDateOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

function getValidDate(rawDate: string) {
  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getPartMap(
  rawDate: string,
  options: Intl.DateTimeFormatOptions = {}
) {
  const date = getValidDate(rawDate);
  if (!date) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...options,
  });

  return formatter.formatToParts(date).reduce<Record<string, string>>(
    (result, part) => {
      if (part.type !== "literal") {
        result[part.type] = part.value;
      }
      return result;
    },
    {}
  );
}

export function formatDateId(
  rawDate: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = getValidDate(rawDate);
  if (!date) {
    return rawDate;
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: APP_TIME_ZONE,
    ...defaultDateOptions,
    ...options,
  }).format(date);
}

export function formatDayNameId(rawDate: string): string {
  const date = getValidDate(rawDate);
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: APP_TIME_ZONE,
    weekday: "long",
  }).format(date);
}

export function getDateKey(rawDate: string) {
  const parts = getPartMap(rawDate);
  if (!parts?.year || !parts.month || !parts.day) {
    return "";
  }

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getMonthKey(rawDate: string) {
  const dateKey = getDateKey(rawDate);
  return dateKey ? dateKey.slice(0, 7) : "";
}

export function getTodayDateKey() {
  return getDateKey(new Date().toISOString());
}

export function getSortedUniqueYears(
  years: Array<number | string>,
  options: { includeCurrentYear?: boolean } = {}
) {
  const normalizedYears = years
    .map((year) => {
      const value = typeof year === "number" ? year : Number.parseInt(year, 10);
      return Number.isFinite(value) ? value : null;
    })
    .filter((year): year is number => year !== null);

  if (options.includeCurrentYear) {
    normalizedYears.unshift(new Date().getFullYear());
  }

  return [...new Set(normalizedYears)].sort((left, right) => right - left);
}

export function getRecentYearOptions(
  options: { fromYear?: number; yearsBack?: number; yearsForward?: number } = {}
) {
  const fromYear = options.fromYear ?? new Date().getFullYear();
  const yearsBack = options.yearsBack ?? 10;
  const yearsForward = options.yearsForward ?? 0;
  const startYear = fromYear + yearsForward;
  const endYear = fromYear - yearsBack;
  const years: number[] = [];

  for (let year = startYear; year >= endYear; year -= 1) {
    years.push(year);
  }

  return years;
}

export function toDateInputValue(rawDate: string | null | undefined) {
  if (!rawDate) {
    return "";
  }

  const parts = getPartMap(rawDate);
  if (!parts?.year || !parts.month || !parts.day) {
    return "";
  }

  return `${parts.year}-${parts.month}-${parts.day}`;
}
