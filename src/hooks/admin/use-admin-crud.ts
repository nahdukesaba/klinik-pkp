"use client";

import { useCallback, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useAdminAuth, type AdminFormValues } from "@/components/admin";
import { useToast } from "@/hooks/use-toast";
import { canManageContent } from "@/lib/admin/roles";
import {
  AdminApiError,
  adminFetch,
  normalizeAdminFieldErrors,
} from "@/lib/admin-client";

import { useAdminCreateIntent } from "./use-admin-create-intent";

/**
 * Shared foundation for all admin CRUD page hooks.
 *
 * Provides: form state, saving/delete lifecycle, query invalidation,
 * create intent (URL query param).
 *
 * Each page hook builds on top by providing entity-specific formFields,
 * initialValues, payload builders, and stats.
 */

export interface UseAdminCrudOptions<TItem extends { id: string | number }> {
  /** React Query key prefix, e.g. "admin-bsps" */
  queryKey: string;
  /** API resource path, e.g. "/api/admin/resources/bsps" */
  resourcePath: string;
  /** Display label for toast messages, e.g. "BSPS" */
  label: string;
  /** Build the API payload from form values */
  buildPayload: (values: AdminFormValues) => unknown | FormData;
  /** Human-readable name for the item being deleted */
  getDeleteLabel: (item: TItem) => string;
}

export function useAdminCrud<TItem extends { id: string | number }>(
  options: UseAdminCrudOptions<TItem>
) {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftValues, setDraftValues] = useState<AdminFormValues>({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const canManage = canManageContent(user.role);

  const openCreateDialog = useCallback(() => {
    setEditingItem(null);
    setFormErrors({});
    setDraftValues({});
    setFormOpen(true);
  }, []);

  useAdminCreateIntent({
    enabled: canManage,
    onCreate: openCreateDialog,
  });

  const refreshData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [options.queryKey] });
  }, [queryClient, options.queryKey]);

  const openEditDialog = useCallback(
    (item: TItem, itemToFormValues: (item: TItem) => AdminFormValues) => {
      setEditingItem(item);
      setFormErrors({});
      setDraftValues(itemToFormValues(item));
      setFormOpen(true);
    },
    []
  );

  const handleSubmit = useCallback(
    async (values: AdminFormValues) => {
      setIsSaving(true);
      setFormErrors({});

      try {
        const payload = options.buildPayload(values);

        const fetchOptions: RequestInit = {
          method: "POST",
          body:
            payload instanceof FormData
              ? payload
              : JSON.stringify(payload),
        };

        if (!(payload instanceof FormData)) {
          fetchOptions.headers = { "Content-Type": "application/json" };
        }

        const url = editingItem
          ? `${options.resourcePath}/${editingItem.id}`
          : options.resourcePath;

        await adminFetch(url, fetchOptions);
        await refreshData();
        setFormOpen(false);
        setEditingItem(null);
        setDraftValues({});

        toast({
          title: editingItem
            ? `Data ${options.label} diperbarui`
            : `Data ${options.label} ditambahkan`,
          description: `Perubahan ${options.label.toLowerCase()} berhasil disimpan.`,
        });
      } catch (error) {
        if (error instanceof AdminApiError) {
          setFormErrors(normalizeAdminFieldErrors(error.details));
        }

        toast({
          title: `Gagal menyimpan ${options.label.toLowerCase()}`,
          description:
            error instanceof Error
              ? error.message
              : `Terjadi kesalahan saat menyimpan ${options.label.toLowerCase()}.`,
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [editingItem, options, refreshData, toast]
  );

  const handleDelete = useCallback(
    async (item: TItem) => {
      if (
        !window.confirm(`Hapus ${options.label.toLowerCase()} "${options.getDeleteLabel(item)}"?`)
      ) {
        return;
      }

      try {
        await adminFetch(`${options.resourcePath}/${item.id}`, {
          method: "DELETE",
        });
        await refreshData();
        toast({
          title: `Data ${options.label} dihapus`,
          description: `Data ${options.label.toLowerCase()} berhasil dihapus.`,
        });
      } catch (error) {
        toast({
          title: `Gagal menghapus ${options.label.toLowerCase()}`,
          description:
            error instanceof Error
              ? error.message
              : "Permintaan tidak berhasil.",
          variant: "destructive",
        });
      }
    },
    [options, refreshData, toast]
  );

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormOpen(open);

    if (!open) {
      setEditingItem(null);
      setFormErrors({});
      setDraftValues({});
    }
  }, []);

  return {
    canManage,
    formOpen,
    editingItem,
    formErrors,
    draftValues,
    isSaving,
    currentPage,
    setDraftValues,
    setCurrentPage,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    refreshData,
  };
}
