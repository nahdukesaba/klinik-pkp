"use client";

import { useCallback, useMemo, useState } from "react";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ImageIcon,
  PencilLine,
  Trash2,
} from "lucide-react";

import {
  type AdminFormValues,
  type TableAction,
  useAdminAuth,
} from "@/components/admin";
import {
  buildSosialisasiDraftValues,
  buildSosialisasiFormData,
  buildSosialisasiFormFields,
  buildSosialisasiViewConfig,
  type SosialisasiAdminView,
} from "@/components/admin/sosialisasi/config";
import { useConfirmDialog } from "@/components/providers/ConfirmDialogProvider";
import { useAdminCreateIntent } from "@/hooks/admin/use-admin-create-intent";
import { useAdminLocationOptions } from "@/hooks/use-admin-location-options";
import { useToast } from "@/hooks/use-toast";
import { getStringFormValue } from "@/lib/admin/form";
import { canManageContent } from "@/lib/admin/roles";
import {
  AdminApiError,
  normalizeAdminFieldErrors,
} from "@/lib/admin-client";
import {
  QUERY_CONFIG,
  QUERY_KEYS,
} from "@/lib/constants";
import {
  buildSosialisasiResultFromLocations,
  createAdminSosialisasi,
  deleteAdminSosialisasi,
  fetchSosialisasiPage,
  updateAdminSosialisasi,
  type SosialisasiLocation,
} from "@/services/sosialisasi.service";

import { useAdminListQuery } from "./use-admin-list-query";

export function useAdminSosialisasiPage(view: SosialisasiAdminView) {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const confirm = useConfirmDialog();
  const queryClient = useQueryClient();
  const listQuery = useAdminListQuery();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SosialisasiLocation | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftValues, setDraftValues] = useState<AdminFormValues>({});
  const [isSaving, setIsSaving] = useState(false);

  const canManage = canManageContent(user.role);
  const { regionOptions, districtOptions, villageOptions } =
    useAdminLocationOptions(
      getStringFormValue(draftValues, "regionId"),
      getStringFormValue(draftValues, "districtId"),
      formOpen && canManage
    );

  const sosialisasiQuery = useQuery({
    queryKey: [
      QUERY_KEYS.adminSosialisasi,
      view,
      listQuery.queryParams,
    ],
    queryFn: ({ signal }) =>
      fetchSosialisasiPage(listQuery.queryParams, { signal }),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
    placeholderData: keepPreviousData,
    enabled: canManage,
  });

  const liveSosialisasiData = useMemo(() => {
    if (!sosialisasiQuery.data) {
      return undefined;
    }

    return {
      ...buildSosialisasiResultFromLocations(sosialisasiQuery.data.locations),
      meta: sosialisasiQuery.data.meta,
    };
  }, [sosialisasiQuery.data]);

  const resetFormState = useCallback(() => {
    setEditingItem(null);
    setFormErrors({});
    setDraftValues({});
  }, []);

  const openCreateDialog = useCallback(() => {
    resetFormState();
    setFormOpen(true);
  }, [resetFormState]);

  const openBeritaUploadDialog = useCallback((item: SosialisasiLocation) => {
    setEditingItem(item);
    setFormErrors({});
    setDraftValues({ images: [] });
    setFormOpen(true);
  }, []);

  const openEditDialog = useCallback((item: SosialisasiLocation) => {
    setEditingItem(item);
    setFormErrors({});
    setDraftValues(buildSosialisasiDraftValues(item) ?? {});
    setFormOpen(true);
  }, []);

  useAdminCreateIntent({
    enabled: canManage && view !== "berita",
    onCreate: openCreateDialog,
  });

  const formFields = useMemo(
    () =>
      buildSosialisasiFormFields({
        view,
        regionOptions,
        districtOptions,
        villageOptions,
        editingItem,
      }),
    [districtOptions, editingItem, regionOptions, view, villageOptions]
  );

  const initialValues = useMemo(() => {
    if (view === "berita") {
      return {
        images: [],
      };
    }

    return buildSosialisasiDraftValues(editingItem);
  }, [editingItem, view]);

  const viewConfig = useMemo(() => {
    const locations = liveSosialisasiData?.locations ?? [];
    const upcomingLocations = liveSosialisasiData?.upcomingLocations ?? [];
    const completedLocations = liveSosialisasiData?.completedLocations ?? [];
    const pendingLocations = liveSosialisasiData?.pendingLocations ?? [];
    const kabupatenCount = Math.max(
      (liveSosialisasiData?.kabupatenList.length ?? 1) - 1,
      0
    );

    return buildSosialisasiViewConfig({
      view,
      locations,
      upcomingLocations,
      completedLocations,
      pendingLocations,
      kabupatenCount,
    });
  }, [liveSosialisasiData, view]);

  const sosialisasiMeta = liveSosialisasiData?.meta;
  const pagination = {
    ...listQuery.tableState,
    currentPage: sosialisasiMeta?.page ?? listQuery.tableState.currentPage,
    totalPages: sosialisasiMeta?.totalPages ?? 1,
    totalItems: sosialisasiMeta?.totalRecords ?? viewConfig.data.length,
    pageSize: sosialisasiMeta?.limit ?? listQuery.tableState.pageSize,
  };

  const refreshSosialisasi = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminSosialisasi] });
  }, [queryClient]);

  const handleSubmit = useCallback(
    async (values: AdminFormValues) => {
      setIsSaving(true);
      setFormErrors({});

      try {
        const formData = buildSosialisasiFormData(values, {
          view,
          existingItem: editingItem,
        });

        if (editingItem) {
          await updateAdminSosialisasi(editingItem.id, formData);
        } else {
          await createAdminSosialisasi(formData);
        }

        await refreshSosialisasi();
        setFormOpen(false);
        resetFormState();
        toast({
          title:
            view === "berita"
              ? "Gambar berita diperbarui"
              : editingItem
                ? `${viewConfig.dialogTitle} diperbarui`
                : `${viewConfig.dialogTitle} ditambahkan`,
          description:
            view === "berita"
              ? "Dokumentasi kegiatan berhasil diunggah."
              : "Perubahan data sosialisasi berhasil disimpan.",
        });
      } catch (error) {
        if (error instanceof AdminApiError) {
          setFormErrors(normalizeAdminFieldErrors(error.details));
        }

        toast({
          title:
            view === "berita"
              ? "Gagal mengunggah gambar berita"
              : "Gagal menyimpan data sosialisasi",
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat menyimpan data sosialisasi.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [editingItem, refreshSosialisasi, resetFormState, toast, view, viewConfig.dialogTitle]
  );

  const handleDelete = useCallback(
    async (item: SosialisasiLocation) => {
      const confirmed = await confirm({
        title: "Hapus kegiatan?",
        description: `Kegiatan "${item.name}" akan dihapus permanen.`,
        confirmLabel: "Hapus",
        destructive: true,
      });

      if (!confirmed) {
        return;
      }

      try {
        await deleteAdminSosialisasi(item.id);
        await refreshSosialisasi();
        toast({
          title: "Kegiatan dihapus",
          description: "Data sosialisasi berhasil dihapus.",
        });
      } catch (error) {
        toast({
          title: "Gagal menghapus kegiatan",
          description:
            error instanceof Error ? error.message : "Permintaan tidak berhasil.",
          variant: "destructive",
        });
      }
    },
    [confirm, refreshSosialisasi, toast]
  );

  const actions = useMemo<TableAction<SosialisasiLocation>[]>(() => {
    if (view === "berita") {
      return [
        {
          label: "Upload Gambar",
          icon: <ImageIcon className="h-4 w-4" />,
          onClick: openBeritaUploadDialog,
        },
      ];
    }

    return [
      {
        label: "Edit",
        icon: <PencilLine className="h-4 w-4" />,
        onClick: openEditDialog,
      },
      {
        label: "Hapus",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDelete,
        variant: "destructive",
      },
    ];
  }, [handleDelete, openBeritaUploadDialog, openEditDialog, view]);

  const handleFormOpenChange = useCallback(
    (open: boolean) => {
      setFormOpen(open);
      if (!open) {
        resetFormState();
      }
    },
    [resetFormState]
  );

  return {
    canManage,
    formOpen,
    editingItem,
    formErrors,
    isSaving,
    searchKeyword: listQuery.searchInput,
    sosialisasiQuery,
    viewConfig,
    sosialisasiMeta,
    pagination,
    formFields,
    initialValues,
    actions,
    openCreateDialog,
    handleSearchChange: listQuery.setSearch,
    resetFilters: listQuery.resetFilters,
    handleSubmit,
    handleFormOpenChange,
    setDraftValues,
  };
}
