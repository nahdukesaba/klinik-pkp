"use client";

import { useCallback, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useAdminCreateIntent } from "@/hooks/admin/use-admin-create-intent";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useAdminLocationOptions } from "@/hooks/use-admin-location-options";
import { useToast } from "@/hooks/use-toast";
import {
  getStringFormValue,
  validateFileField,
  validateTotalFileSize,
} from "@/lib/admin/form";
import { canManageContent } from "@/lib/admin/roles";
import {
  AdminApiError,
  adminFetch,
  normalizeAdminFieldErrors,
} from "@/lib/admin-client";
import { QUERY_CONFIG } from "@/lib/constants";
import {
  buildSosialisasiResultFromLocations,
  fetchSosialisasiPage,
  type SosialisasiLocation,
} from "@/services/sosialisasi.service";

const SOSIALISASI_PAGE_LIMIT = 10;

export function useAdminSosialisasiPage(view: SosialisasiAdminView) {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentTime = useCurrentTime();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SosialisasiLocation | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftValues, setDraftValues] = useState<AdminFormValues>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pagesByView, setPagesByView] = useState<Record<SosialisasiAdminView, number>>({
    lokasi: 1,
    jadwal: 1,
    berita: 1,
  });

  const canManage = canManageContent(user.role);
  const currentPage = pagesByView[view];
  const { regionOptions, districtOptions, villageOptions } =
    useAdminLocationOptions(
      getStringFormValue(draftValues, "regionId"),
      getStringFormValue(draftValues, "districtId"),
      formOpen && canManage
    );

  const sosialisasiQuery = useQuery({
    queryKey: ["admin-sosialisasi", view, currentPage],
    queryFn: () =>
      fetchSosialisasiPage({
        page: currentPage,
        perPage: SOSIALISASI_PAGE_LIMIT,
      }),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
    placeholderData: (previousData) => previousData,
    enabled: canManage,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  const liveSosialisasiData = useMemo(() => {
    if (!sosialisasiQuery.data) {
      return undefined;
    }

    return {
      ...buildSosialisasiResultFromLocations(
        sosialisasiQuery.data.locations,
        currentTime
      ),
      meta: sosialisasiQuery.data.meta,
    };
  }, [currentTime, sosialisasiQuery.data]);

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

  const handlePageChange = useCallback(
    (page: number) => {
      setPagesByView((current) => ({
        ...current,
        [view]: page,
      }));
    },
    [view]
  );

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

  const refreshSosialisasi = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-sosialisasi"] });
  }, [queryClient]);

  const handleSubmit = useCallback(
    async (values: AdminFormValues) => {
      setIsSaving(true);
      setFormErrors({});

      try {
        const imageValidationError = validateFileField(values, {
          field: "images",
          label: view === "berita" ? "Gambar berita" : "Gambar kegiatan",
          maxFiles: 4,
          maxSizeMb: 2,
          required: view === "berita",
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

        const totalUploadError = validateTotalFileSize(values, {
          fields: [{ field: "images", label: "Gambar kegiatan" }],
          maxTotalSizeMb: 4,
        });
        if (totalUploadError) {
          setFormErrors({ images: totalUploadError });
          toast({
            title: "Upload belum valid",
            description: totalUploadError,
            variant: "destructive",
          });
          return;
        }

        const formData = buildSosialisasiFormData(values, {
          view,
          existingItem: editingItem,
        });

        if (editingItem) {
          await adminFetch(`/api/admin/resources/sosialisasi/${editingItem.id}`, {
            method: "PUT",
            body: formData,
          });
        } else {
          await adminFetch("/api/admin/resources/sosialisasi", {
            method: "POST",
            body: formData,
          });
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
      if (!window.confirm(`Hapus kegiatan "${item.name}"?`)) {
        return;
      }

      try {
        await adminFetch(`/api/admin/resources/sosialisasi/${item.id}`, {
          method: "DELETE",
        });
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
    [refreshSosialisasi, toast]
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
    currentPage,
    sosialisasiQuery,
    viewConfig,
    sosialisasiMeta,
    formFields,
    initialValues,
    actions,
    openCreateDialog,
    handlePageChange,
    handleSubmit,
    handleFormOpenChange,
    setDraftValues,
  };
}
