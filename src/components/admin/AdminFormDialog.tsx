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

import { Loader2 } from "lucide-react";

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
  helperText?: string;
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
  }

  return defaults;
}

function buildFormStateKey(
  fields: FormFieldDef[],
  initialValues: AdminFormValues
) {
  const fieldSignature = fields
    .map((field) => `${field.name}:${field.type}:${field.defaultValue ?? ""}`)
    .join("|");
  const initialValueSignature = Object.entries(initialValues)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) =>
      `${key}:${Array.isArray(value) ? value.map((file) => file.name).join(",") : value}`
    )
    .join("|");

  return `${fieldSignature}|${initialValueSignature}`;
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
              <div className="space-y-2">
                <Input
                  id={`admin-form-${field.name}`}
                  type="file"
                  accept={field.accept}
                  multiple={field.multiple}
                  required={field.required && fileValue.length === 0}
                  onChange={(event) =>
                    handleChange(
                      field.name,
                      Array.from(event.target.files ?? [])
                    )
                  }
                  className={cn(
                    "cursor-pointer",
                    errors[field.name] &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {fileValue.length > 0 && (
                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                    <p className="text-xs font-medium text-foreground">
                      {fileValue.length} file dipilih
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {fileValue.map((file) => file.name).join(", ")}
                    </p>
                  </div>
                )}
              </div>
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

            {errors[field.name] && (
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
