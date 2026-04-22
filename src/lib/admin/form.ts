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

interface UploadFieldHelperOptions {
  subject: string;
  mode?: "create" | "edit";
  optional?: boolean;
  requiresReuploadOnEdit?: boolean;
  validationLabel?: string;
  maxSizeMb?: number;
  totalUploadMb?: number;
}

function buildUploadValidationSummary(options: UploadFieldHelperOptions) {
  const parts: string[] = [];

  if (options.validationLabel) {
    parts.push(options.validationLabel);
  }

  if (options.maxSizeMb) {
    parts.push(`ukuran maksimal ${options.maxSizeMb} MB per file`);
  }

  if (options.totalUploadMb) {
    parts.push(`total upload efektif sekitar ${options.totalUploadMb} MB`);
  }

  if (parts.length === 0) {
    return "";
  }

  return `Backend akan memvalidasi ${parts.join(", ")}.`;
}

export function buildUploadFieldHelperText(options: UploadFieldHelperOptions) {
  const mode = options.mode ?? "create";
  let intro = `Unggah ${options.subject}.`;

  if (mode === "edit" && options.requiresReuploadOnEdit) {
    intro = `Saat menyimpan perubahan, unggah ulang ${options.subject}.`;
  } else if (mode === "edit" && options.optional) {
    intro = `Tambahkan ${options.subject} baru bila diperlukan.`;
  } else if (options.optional) {
    intro = `Tambahkan ${options.subject} bila diperlukan.`;
  }

  const validationSummary = buildUploadValidationSummary(options);
  return validationSummary ? `${intro} ${validationSummary}` : intro;
}
