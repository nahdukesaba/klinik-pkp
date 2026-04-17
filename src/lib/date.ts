/**
 * Helper tanggal/jam terpusat untuk aplikasi Klinik PKP.
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
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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

export function getTimeKey(rawDate: string) {
  const parts = getPartMap(rawDate);
  if (!parts?.hour || !parts.minute) {
    return "";
  }

  return `${parts.hour}:${parts.minute}`;
}

export function formatTimeRangeId(startRawDate: string, endRawDate: string) {
  const start = getTimeKey(startRawDate);
  const end = getTimeKey(endRawDate);

  if (!start || !end) {
    return "";
  }

  return `${start} - ${end}`;
}

export function toDateTimeLocalInputValue(rawDate: string | null | undefined) {
  if (!rawDate) {
    return "";
  }

  const parts = getPartMap(rawDate);
  if (!parts?.year || !parts.month || !parts.day || !parts.hour || !parts.minute) {
    return "";
  }

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
