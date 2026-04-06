"use client";

import { useCallback, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminAuth, type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useToast } from "@/hooks/use-toast";
import {
  getFileFormValue,
  getStringFormValue,
  validateFileField,
} from "@/lib/admin/form";
import { canManageContent } from "@/lib/admin/roles";
import {
  AdminApiError,
  adminFetch,
  normalizeAdminFieldErrors,
} from "@/lib/admin-client";
import { QUERY_CONFIG } from "@/lib/constants";
import {
  fetchBankDesainPage,
  type BankDesainData,
} from "@/services/bank-desain.service";

import { useAdminCreateIntent } from "./use-admin-create-intent";

const BANK_DESAIN_PAGE_LIMIT = 10;

const typeOptions = [
  { value: "Tipe 36", label: "Tipe 36" },
  { value: "Tipe 45", label: "Tipe 45" },
  { value: "Tipe 54", label: "Tipe 54" },
  { value: "Rusun", label: "Rusun" },
];

const frontendTypeToApiType = {
  T36: "Tipe 36",
  T45: "Tipe 45",
  T54: "Tipe 54",
  Rusun: "Rusun",
} as const;

function buildBankDesainFormData(values: AdminFormValues) {
  const formData = new FormData();

  formData.set("name", getStringFormValue(values, "name"));
  formData.set("type", getStringFormValue(values, "type"));
  formData.set("bedroom_count", getStringFormValue(values, "bedroomCount"));
  formData.set("bathroom_count", getStringFormValue(values, "bathroomCount"));
  formData.set("total_area", getStringFormValue(values, "totalArea"));
  formData.set("has_garage", getStringFormValue(values, "hasGarage"));

  for (const image of getFileFormValue(values, "images")) {
    formData.append("images", image);
  }

  for (const file of getFileFormValue(values, "files")) {
    formData.append("files", file);
  }

  return formData;
}

export function useAdminBankDesainPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BankDesainData | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [, setDraftValues] = useState<AdminFormValues>({});
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

  const desainQuery = useQuery({
    queryKey: ["admin-bank-desain", currentPage],
    queryFn: () =>
      fetchBankDesainPage({
        page: currentPage,
        perPage: BANK_DESAIN_PAGE_LIMIT,
      }),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
    placeholderData: (previousData) => previousData,
    enabled: canManage,
  });

  const formFields = useMemo<FormFieldDef[]>(
    () => [
      {
        name: "name",
        label: "Nama Desain",
        type: "text",
        required: true,
      },
      {
        name: "type",
        label: "Tipe",
        type: "select",
        required: true,
        options: typeOptions,
      },
      {
        name: "bedroomCount",
        label: "Jumlah Kamar Tidur",
        type: "number",
        required: true,
      },
      {
        name: "bathroomCount",
        label: "Jumlah Kamar Mandi",
        type: "number",
        required: true,
      },
      {
        name: "totalArea",
        label: "Luas Bangunan",
        type: "number",
        required: true,
      },
      {
        name: "hasGarage",
        label: "Fitur Garasi/Teras",
        type: "select",
        required: true,
        options: [
          { value: "true", label: "Dengan Garasi/Teras" },
          { value: "false", label: "Tanpa Garasi/Teras" },
        ],
      },
      {
        name: "images",
        label: "Gambar Desain",
        type: "file",
        accept: "image/*",
        multiple: true,
        required: !editingItem,
        helperText: editingItem
          ? "Opsional. Unggah gambar baru jika ingin mengganti gambar lama. Maksimal 2 MB per gambar."
          : "Unggah gambar desain rumah. Maksimal 2 MB per gambar.",
      },
      {
        name: "files",
        label: "File Dokumen",
        type: "file",
        accept: ".pdf,.zip,.rar,.dwg,.jpg,.png",
        multiple: true,
        required: !editingItem,
        helperText: editingItem
          ? "Opsional. Unggah dokumen baru jika ingin mengganti file lama. Maksimal 5 MB per file."
          : "Unggah file blueprint atau dokumen desain. Maksimal 5 MB per file.",
      },
    ],
    [editingItem]
  );

  const initialValues = editingItem
    ? {
        name: editingItem.title,
        type:
          frontendTypeToApiType[
            editingItem.type as keyof typeof frontendTypeToApiType
          ] ?? editingItem.type,
        bedroomCount: String(editingItem.bedrooms),
        bathroomCount: String(editingItem.bathrooms),
        totalArea: String(editingItem.area),
        hasGarage: editingItem.terasFeature === "dengan-teras" ? "true" : "false",
        images: [],
        files: [],
      }
    : undefined;

  const desainList = desainQuery.data?.items ?? [];
  const desainMeta = desainQuery.data?.meta;
  const typeStats = useMemo(
    () =>
      desainList.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    [desainList]
  );

  const refreshDesain = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-bank-desain"] });
  }, [queryClient]);

  const openEditDialog = useCallback((item: BankDesainData) => {
    setEditingItem(item);
    setFormErrors({});
    setDraftValues({
      name: item.title,
      type:
        frontendTypeToApiType[
          item.type as keyof typeof frontendTypeToApiType
        ] ?? item.type,
      bedroomCount: String(item.bedrooms),
      bathroomCount: String(item.bathrooms),
      totalArea: String(item.area),
      hasGarage: item.terasFeature === "dengan-teras" ? "true" : "false",
      images: [],
      files: [],
    });
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (values: AdminFormValues) => {
      setIsSaving(true);
      setFormErrors({});

      try {
        const imageValidationError = validateFileField(values, {
          field: "images",
          label: "Gambar desain",
          maxSizeMb: 2,
          required: !editingItem,
          acceptImagesOnly: true,
        });

        if (imageValidationError) {
          setFormErrors({ images: imageValidationError });
          toast({
            title: "Upload belum valid",
            description: imageValidationError,
            variant: "destructive",
          });
          return;
        }

        const fileValidationError = validateFileField(values, {
          field: "files",
          label: "File dokumen",
          maxSizeMb: 5,
          required: !editingItem,
        });

        if (fileValidationError) {
          setFormErrors({ files: fileValidationError });
          toast({
            title: "Upload belum valid",
            description: fileValidationError,
            variant: "destructive",
          });
          return;
        }

        const formData = buildBankDesainFormData(values);

        if (editingItem) {
          await adminFetch(`/api/admin/resources/bank-desain/${editingItem.id}`, {
            method: "PUT",
            body: formData,
          });
        } else {
          await adminFetch("/api/admin/resources/bank-desain", {
            method: "POST",
            body: formData,
          });
        }

        await refreshDesain();
        setFormOpen(false);
        setEditingItem(null);
        setDraftValues({});
        toast({
          title: editingItem
            ? "Data desain diperbarui"
            : "Data desain ditambahkan",
          description: "Perubahan bank desain berhasil disimpan.",
        });
      } catch (error) {
        if (error instanceof AdminApiError) {
          setFormErrors(normalizeAdminFieldErrors(error.details));
        }

        toast({
          title: "Gagal menyimpan bank desain",
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat menyimpan bank desain.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [editingItem, refreshDesain, toast]
  );

  const handleDelete = useCallback(
    async (item: BankDesainData) => {
      if (!window.confirm(`Hapus desain "${item.title}"?`)) {
        return;
      }

      try {
        await adminFetch(`/api/admin/resources/bank-desain/${item.id}`, {
          method: "DELETE",
        });
        await refreshDesain();
        toast({
          title: "Data desain dihapus",
          description: "Data bank desain berhasil dihapus.",
        });
      } catch (error) {
        toast({
          title: "Gagal menghapus bank desain",
          description:
            error instanceof Error ? error.message : "Permintaan tidak berhasil.",
          variant: "destructive",
        });
      }
    },
    [refreshDesain, toast]
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
    isSaving,
    desainQuery,
    desainList,
    desainMeta,
    typeStats,
    formFields,
    initialValues,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    setCurrentPage,
  };
}
