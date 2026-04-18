import type { AdminFormValues } from "@/components/admin/AdminFormDialog";
import { toDateTimeLocalInputValue } from "@/lib/date";

export function getStringFormValue(values: AdminFormValues, key: string) {
  const value = values[key];
  return typeof value === "string" ? value : "";
}

export function getNumberFormValue(values: AdminFormValues, key: string) {
  const value = Number(getStringFormValue(values, key));
  return Number.isFinite(value) ? value : 0;
}

export function getFileFormValue(values: AdminFormValues, key: string) {
  const value = values[key];
  return Array.isArray(value) ? value : [];
}

interface FileValidationOptions {
  field: string;
  label: string;
  maxFiles?: number;
  maxSizeMb: number;
  required?: boolean;
  acceptImagesOnly?: boolean;
}

export function validateFileField(
  values: AdminFormValues,
  options: FileValidationOptions
) {
  const files = getFileFormValue(values, options.field);
  const maxBytes = options.maxSizeMb * 1024 * 1024;

  if (options.required && files.length === 0) {
    return `${options.label} wajib diunggah.`;
  }

  if (options.maxFiles && files.length > options.maxFiles) {
    return `${options.label} maksimal ${options.maxFiles} file.`;
  }

  for (const file of files) {
    if (options.acceptImagesOnly && !file.type.startsWith("image/")) {
      return `${options.label} hanya menerima file gambar.`;
    }

    if (file.size > maxBytes) {
      return `${file.name} melebihi batas ${options.maxSizeMb} MB.`;
    }
  }

  return undefined;
}

export function validateTotalFileSize(
  values: AdminFormValues,
  options: {
    fields: Array<{ field: string; label: string }>;
    maxTotalSizeMb: number;
  }
) {
  const maxTotalBytes = options.maxTotalSizeMb * 1024 * 1024;
  const files = options.fields.flatMap(({ field }) => getFileFormValue(values, field));
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  if (totalBytes > maxTotalBytes) {
    const labels = options.fields.map((item) => item.label.toLowerCase()).join(" + ");
    return `Total ukuran ${labels} melebihi batas ${options.maxTotalSizeMb} MB.`;
  }

  return undefined;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function toDateTimeLocalValue(isoString: string | null | undefined) {
  return toDateTimeLocalInputValue(isoString);
}

export function toIsoStringFromDateTimeLocal(value: string) {
  if (!value) {
    return "";
  }

  const match = value.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2}))?$/
  );
  if (!match) {
    return "";
  }

  const [, datePart, timePart, secondsPart] = match;
  const seconds = secondsPart ?? "00";
  const localDate = new Date(`${datePart}T${timePart}:${seconds}`);

  if (Number.isNaN(localDate.getTime())) {
    return "";
  }

  const offsetMinutes = -localDate.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absoluteOffset / 60));
  const offsetRemainderMinutes = pad(absoluteOffset % 60);

  return `${datePart}T${timePart}:${seconds}${sign}${offsetHours}:${offsetRemainderMinutes}`;
}
