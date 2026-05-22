import type {
  AdminFormValues,
  ExistingUploadFile,
} from "@/components/admin/AdminFormDialog";
import { toDateInputValue } from "@/lib/date";

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

export function getExistingFileFormValue(values: AdminFormValues, key: string) {
  return getStringFormValue(values, `${key}Existing`);
}

function getUploadFileName(url: string, fallback: string) {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").filter(Boolean).pop();
    return name ? decodeURIComponent(name) : fallback;
  } catch {
    const name = url.split("/").filter(Boolean).pop();
    return name ? decodeURIComponent(name) : fallback;
  }
}

export function buildExistingUploadFiles(
  urls: Array<string | undefined | null>,
  fallbackPrefix: string
): ExistingUploadFile[] {
  return urls
    .filter((url): url is string => Boolean(url))
    .map((url, index) => ({
      url,
      name: getUploadFileName(url, `${fallbackPrefix} ${index + 1}`),
    }));
}

export function toDateValue(rawDate: string | null | undefined) {
  return toDateInputValue(rawDate);
}

export function toBackendDateValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

interface UploadFieldHelperOptions {
  subject: string;
  mode?: "create" | "edit";
  optional?: boolean;
  validationLabel?: string;
  maxSizeMb?: number;
  totalUploadMb?: number;
}

function buildUploadValidationSummary(options: UploadFieldHelperOptions) {
  const constraints: string[] = [];
  let typeLabel = "";

  if (options.validationLabel) {
    const label = options.validationLabel.toLowerCase();
    if (label.includes("pdf")) {
      typeLabel = "PDF";
    } else if (label.includes("gambar")) {
      typeLabel = "Gambar";
    }
  }

  if (options.maxSizeMb) {
    constraints.push(`maksimal ${options.maxSizeMb} MB per file`);
  }

  if (options.totalUploadMb) {
    constraints.push(`total maksimal ${options.totalUploadMb} MB`);
  }

  if (constraints.length === 0) {
    return "";
  }

  return `${typeLabel ? `${typeLabel} ` : ""}${constraints.join(", ")}.`;
}

export function buildUploadFieldHelperText(options: UploadFieldHelperOptions) {
  const mode = options.mode ?? "create";
  let intro = `Upload ${options.subject}.`;

  if (mode === "edit" && options.optional) {
    intro = "File lama tetap dipakai. Upload baru bila diperlukan.";
  } else if (options.optional) {
    intro = `Upload ${options.subject} bila diperlukan.`;
  }

  const validationSummary = buildUploadValidationSummary(options);
  return validationSummary ? `${intro} ${validationSummary}` : intro;
}
