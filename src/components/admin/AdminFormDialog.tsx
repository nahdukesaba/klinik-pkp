/**
 * AdminFormDialog - Dialog CRUD form untuk admin dashboard.
 *
 * Wrapper dialog dengan form layout yang konsisten:
 * header, body (fields), footer (cancel + submit).
 *
 * Reuses Radix Dialog dari @/components/ui/dialog.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// --- Types ---

export type AdminFormValue = string | File[];
export type AdminFormValues = Record<string, AdminFormValue>;

export interface ExistingUploadFile {
  name: string;
  url: string;
}

export interface FormFieldDef {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "number"
    | "datetime-local"
    | "file";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  maxTotalSizeMb?: number;
  helperText?: string;
  existingFiles?: ExistingUploadFile[];
}

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormFieldDef[];
  /** Initial values for edit mode */
  initialValues?: AdminFormValues;
  onSubmit: (values: AdminFormValues) => void | Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  /** Validation errors keyed by field name */
  errors?: Record<string, string>;
  onValuesChange?: (values: AdminFormValues) => void;
}

interface AdminFormDialogBodyProps {
  fields: FormFieldDef[];
  initialValues: AdminFormValues;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdminFormValues) => void | Promise<void>;
  submitLabel: string;
  isLoading: boolean;
  errors: Record<string, string>;
  onValuesChange?: (values: AdminFormValues) => void;
}

function buildDefaultValues(
  fields: FormFieldDef[],
  initialValues: AdminFormValues
) {
  const defaults: AdminFormValues = {};

  for (const field of fields) {
    defaults[field.name] =
      initialValues[field.name] ??
      (field.type === "file" ? [] : field.defaultValue ?? "");

    if (field.type === "file" && field.existingFiles) {
      defaults[`${field.name}Existing`] =
        initialValues[`${field.name}Existing`] ??
        JSON.stringify(field.existingFiles);
    }
  }

  return defaults;
}

function buildFormStateKey(
  fields: FormFieldDef[],
  initialValues: AdminFormValues
) {
  const fieldSignature = fields
    .map((field) => {
      const existingSignature =
        field.existingFiles?.map((file) => file.url).join(",") ?? "";
      return `${field.name}:${field.type}:${field.defaultValue ?? ""}:${existingSignature}`;
    })
    .join("|");
  const initialValueSignature = Object.entries(initialValues)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) =>
      `${key}:${Array.isArray(value) ? value.map((file) => file.name).join(",") : value}`
    )
    .join("|");

  return `${fieldSignature}|${initialValueSignature}`;
}

function mergeFiles(currentFiles: File[], nextFiles: File[], allowMultiple: boolean) {
  if (!allowMultiple) {
    return nextFiles.slice(0, 1);
  }

  const merged = [...currentFiles];

  for (const nextFile of nextFiles) {
    const alreadyExists = merged.some(
      (currentFile) =>
        currentFile.name === nextFile.name &&
        currentFile.size === nextFile.size &&
        currentFile.lastModified === nextFile.lastModified
    );

    if (!alreadyExists) {
      merged.push(nextFile);
    }
  }

  return merged;
}

function parseExistingFiles(value: AdminFormValue | undefined) {
  if (typeof value !== "string" || !value) {
    return [] as ExistingUploadFile[];
  }

  try {
    const parsed = JSON.parse(value) as ExistingUploadFile[];
    return Array.isArray(parsed)
      ? parsed.filter(
          (file) =>
            typeof file?.name === "string" && typeof file?.url === "string"
        )
      : [];
  } catch {
    return [];
  }
}

function isImageUploadField(field: FormFieldDef) {
  return field.accept?.includes("image") ?? false;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isAcceptedFile(file: File, accept?: string) {
  if (!accept) {
    return true;
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  const acceptedTokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  return acceptedTokens.some((token) => {
    if (token.endsWith("/*")) {
      return fileType.startsWith(token.slice(0, -1));
    }

    if (token.startsWith(".")) {
      return fileName.endsWith(token);
    }

    return fileType === token;
  });
}

function validateUploadFiles(
  field: FormFieldDef,
  currentFiles: File[],
  nextFiles: File[],
  existingFileCount: number
) {
  const mergedFiles = mergeFiles(currentFiles, nextFiles, Boolean(field.multiple));
  const maxFiles = field.maxFiles ?? (field.multiple ? undefined : 1);
  const totalPlannedFiles = field.multiple
    ? existingFileCount + mergedFiles.length
    : mergedFiles.length;

  if (maxFiles && totalPlannedFiles > maxFiles) {
    return {
      files: currentFiles,
      error: `Maksimal ${maxFiles} file untuk ${field.label.toLowerCase()}.`,
    };
  }

  const unsupportedFile = nextFiles.find((file) => !isAcceptedFile(file, field.accept));
  if (unsupportedFile) {
    return {
      files: currentFiles,
      error: `Format file "${unsupportedFile.name}" tidak didukung.`,
    };
  }

  if (field.maxSizeMb) {
    const maxSizeBytes = field.maxSizeMb * 1024 * 1024;
    const oversizedFile = nextFiles.find((file) => file.size > maxSizeBytes);

    if (oversizedFile) {
      return {
        files: currentFiles,
        error: `"${oversizedFile.name}" melebihi batas ${field.maxSizeMb} MB.`,
      };
    }
  }

  if (field.maxTotalSizeMb) {
    const totalSizeBytes = mergedFiles.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSizeBytes = field.maxTotalSizeMb * 1024 * 1024;

    if (totalSizeBytes > maxTotalSizeBytes) {
      return {
        files: currentFiles,
        error: `Total upload melebihi batas ${field.maxTotalSizeMb} MB.`,
      };
    }
  }

  return { files: mergedFiles, error: "" };
}

function useObjectUrlPreviews(files: File[], enabled: boolean) {
  const previewUrls = useMemo(
    () => (enabled ? files.map((file) => URL.createObjectURL(file)) : []),
    [enabled, files]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return previewUrls;
}

interface UploadFieldProps {
  field: FormFieldDef;
  fileValue: File[];
  existingFiles: ExistingUploadFile[];
  existingFieldName: string;
  error?: string;
  onChange: (name: string, value: AdminFormValue) => void;
}

function UploadField({
  field,
  fileValue,
  existingFiles,
  existingFieldName,
  error,
  onChange,
}: UploadFieldProps) {
  const [localError, setLocalError] = useState("");
  const isImageUpload = isImageUploadField(field);
  const previewUrls = useObjectUrlPreviews(fileValue, isImageUpload);
  const displayedError = localError || error;

  const handleRemoveExistingFile = useCallback(
    (url: string) => {
      onChange(
        existingFieldName,
        JSON.stringify(
          existingFiles.filter((existingFile) => existingFile.url !== url)
        )
      );
    },
    [existingFieldName, existingFiles, onChange]
  );

  const handleRemoveNewFile = useCallback(
    (index: number) => {
      setLocalError("");
      onChange(
        field.name,
        fileValue.filter((_, fileIndex) => fileIndex !== index)
      );
    },
    [field.name, fileValue, onChange]
  );

  return (
    <div className="space-y-2">
      <Input
        id={`admin-form-${field.name}`}
        type="file"
        accept={field.accept}
        multiple={field.multiple}
        required={
          field.required &&
          fileValue.length === 0 &&
          existingFiles.length === 0
        }
        onChange={(event) => {
          const nextFiles = Array.from(event.target.files ?? []);
          const result = validateUploadFiles(
            field,
            fileValue,
            nextFiles,
            existingFiles.length
          );

          if (result.error) {
            setLocalError(result.error);
          } else {
            setLocalError("");
            onChange(field.name, result.files);
          }

          event.currentTarget.value = "";
        }}
        className={cn(
          "cursor-pointer",
          displayedError &&
            "border-destructive focus-visible:ring-destructive"
        )}
      />

      {existingFiles.length > 0 && (
        <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
          <p className="text-xs font-medium text-foreground">File saat ini</p>
          <div
            className={cn(
              "mt-2 gap-2",
              isImageUpload ? "grid grid-cols-2 sm:grid-cols-3" : "space-y-2"
            )}
          >
            {existingFiles.map((file) => (
              <div
                key={file.url}
                className={cn(
                  "relative rounded-md border border-border/70 bg-background/80",
                  isImageUpload ? "overflow-hidden" : "px-2.5 py-2"
                )}
              >
                {isImageUpload ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-video bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${file.url})` }}
                    aria-label={`Buka ${file.name}`}
                  />
                ) : (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block min-w-0 truncate pr-9 text-xs font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    {file.name}
                  </a>
                )}
                {isImageUpload && (
                  <p className="truncate px-2 py-1.5 text-[11px] font-medium text-foreground">
                    {file.name}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveExistingFile(file.url)}
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Hapus ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {fileValue.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
          <p className="text-xs font-medium text-foreground">File baru</p>
          <div
            className={cn(
              "mt-2 gap-2",
              isImageUpload ? "grid grid-cols-2 sm:grid-cols-3" : "space-y-2"
            )}
          >
            {fileValue.map((file, index) => (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className={cn(
                  "relative rounded-md border border-border/70 bg-background/80",
                  isImageUpload ? "overflow-hidden" : "px-2.5 py-2"
                )}
              >
                {isImageUpload ? (
                  <div
                    className="aspect-video bg-muted bg-cover bg-center"
                    style={{
                      backgroundImage: previewUrls[index]
                        ? `url(${previewUrls[index]})`
                        : undefined,
                    }}
                    aria-label={file.name}
                  />
                ) : null}
                <div className={isImageUpload ? "px-2 py-1.5" : "pr-9"}>
                  <p className="truncate text-xs font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveNewFile(index)}
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Hapus ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          {field.multiple && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Pilih file lagi kapan pun untuk menambahkan gambar lainnya.
            </p>
          )}
        </div>
      )}

      {displayedError && (
        <p className="text-xs text-destructive">{displayedError}</p>
      )}
    </div>
  );
}

function AdminFormDialogBody({
  fields,
  initialValues,
  onOpenChange,
  onSubmit,
  submitLabel,
  isLoading,
  errors,
  onValuesChange,
}: AdminFormDialogBodyProps) {
  const defaultValues = useMemo(
    () => buildDefaultValues(fields, initialValues),
    [fields, initialValues]
  );
  const [values, setValues] = useState<AdminFormValues>(defaultValues);

  useEffect(() => {
    if (!onValuesChange) {
      return;
    }

    onValuesChange(values);
  }, [onValuesChange, values]);

  const handleChange = useCallback((name: string, value: AdminFormValue) => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      onSubmit(values);
    },
    [onSubmit, values]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {fields.map((field) => {
        const fieldValue = values[field.name];
        const stringValue = typeof fieldValue === "string" ? fieldValue : "";
        const fileValue = Array.isArray(fieldValue) ? fieldValue : [];
        const existingFieldName = `${field.name}Existing`;
        const existingFiles = parseExistingFiles(values[existingFieldName]);

        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={`admin-form-${field.name}`}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && (
                <span className="ml-0.5 text-destructive">*</span>
              )}
            </Label>

            {field.type === "textarea" ? (
              <textarea
                id={`admin-form-${field.name}`}
                placeholder={field.placeholder}
                value={stringValue}
                onChange={(event) => handleChange(field.name, event.target.value)}
                required={field.required}
                rows={4}
                className={cn(
                  "flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2",
                  errors[field.name] &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
            ) : field.type === "select" ? (
              <select
                id={`admin-form-${field.name}`}
                value={stringValue}
                onChange={(event) => handleChange(field.name, event.target.value)}
                required={field.required}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  errors[field.name] &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              >
                <option value="">Pilih {field.label.toLowerCase()}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "file" ? (
              <UploadField
                field={field}
                fileValue={fileValue}
                existingFiles={existingFiles}
                existingFieldName={existingFieldName}
                error={errors[field.name]}
                onChange={handleChange}
              />
            ) : (
              <Input
                id={`admin-form-${field.name}`}
                type={field.type}
                placeholder={field.placeholder}
                value={stringValue}
                onChange={(event) => handleChange(field.name, event.target.value)}
                required={field.required}
                className={cn(
                  errors[field.name] &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
            )}

            {field.helperText && (
              <p className="text-xs text-muted-foreground">{field.helperText}</p>
            )}

            {field.type !== "file" && errors[field.name] && (
              <p className="text-xs text-destructive">{errors[field.name]}</p>
            )}
          </div>
        );
      })}

      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AdminFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Simpan",
  isLoading = false,
  errors = {},
  onValuesChange,
}: AdminFormDialogProps) {
  const formStateKey = useMemo(
    () => buildFormStateKey(fields, initialValues),
    [fields, initialValues]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {open && (
          <AdminFormDialogBody
            key={formStateKey}
            fields={fields}
            initialValues={initialValues}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
            submitLabel={submitLabel}
            isLoading={isLoading}
            errors={errors}
            onValuesChange={onValuesChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
