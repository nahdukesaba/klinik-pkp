/**
 * Date formatting helpers (Indonesian locale)
 */

const defaultDateOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

export function formatDateId(
  rawDate: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = new Date(rawDate);
  return new Intl.DateTimeFormat("id-ID", {
    ...defaultDateOptions,
    ...options,
  }).format(date);
}

export function formatDayNameId(rawDate: string): string {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(
    new Date(rawDate)
  );
}
