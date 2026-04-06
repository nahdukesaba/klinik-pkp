import type { AdminFormValues } from "@/components/admin/AdminFormDialog";

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

export function getStringOnlyFormValues(values: AdminFormValues) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === "string" ? value : ""])
  );
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function toDateTimeLocalValue(isoString: string | null | undefined) {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toIsoStringFromDateTimeLocal(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
