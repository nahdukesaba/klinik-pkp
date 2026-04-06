"use client";

import { useCallback, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminAuth, type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useAdminLocationOptions } from "@/hooks/use-admin-location-options";
import { useToast } from "@/hooks/use-toast";
import {
  getFileFormValue,
  getNumberFormValue,
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
import { fetchRusunPage, type RusunData } from "@/services/rusun.service";

import { useAdminCreateIntent } from "./use-admin-create-intent";

const RUSUN_PAGE_LIMIT = 10;

function buildRusunFormData(values: AdminFormValues) {
  const formData = new FormData();

  formData.set("village_id", getStringFormValue(values, "villageId"));
  formData.set("district_id", getStringFormValue(values, "districtId"));
  formData.set("region_id", getStringFormValue(values, "regionId"));
  formData.set("name", getStringFormValue(values, "name"));
  formData.set("address", getStringFormValue(values, "address"));
  formData.set("tower", getStringFormValue(values, "tower"));
  formData.set("unit_type", getStringFormValue(values, "unitType"));
  formData.set("floor", getStringFormValue(values, "floor"));
  formData.set("unit_count", getStringFormValue(values, "unitCount"));
  formData.set("year_given", getStringFormValue(values, "yearGiven"));
  formData.set(
    "coordinate",
    JSON.stringify({
      latitude: getNumberFormValue(values, "latitude"),
      longitude: getNumberFormValue(values, "longitude"),
    })
  );

  for (const file of getFileFormValue(values, "images")) {
    formData.append("images", file);
  }

  return formData;
}

export function useAdminRusunPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RusunData | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftValues, setDraftValues] = useState<AdminFormValues>({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const canManage = canManageContent(user.role);
  const { regionOptions, districtOptions, villageOptions } =
    useAdminLocationOptions(
      getStringFormValue(draftValues, "regionId"),
      getStringFormValue(draftValues, "districtId"),
      formOpen && canManage
    );

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

  const rusunQuery = useQuery({
    queryKey: ["admin-rusun", currentPage],
    queryFn: () =>
      fetchRusunPage({
        page: currentPage,
        perPage: RUSUN_PAGE_LIMIT,
      }),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
    placeholderData: (previousData) => previousData,
    enabled: canManage,
  });

  const formFields = useMemo<FormFieldDef[]>(
    () => [
      {
        name: "regionId",
        label: "Kabupaten/Kota",
        type: "select",
        required: true,
        options: regionOptions,
      },
      {
        name: "districtId",
        label: "Kecamatan",
        type: "select",
        required: true,
        options: districtOptions,
      },
      {
        name: "villageId",
        label: "Desa/Kelurahan",
        type: "select",
        required: true,
        options: villageOptions,
      },
      {
        name: "name",
        label: "Nama Rusun",
        type: "text",
        required: true,
      },
      {
        name: "address",
        label: "Alamat",
        type: "textarea",
        required: true,
      },
      {
        name: "tower",
        label: "Jumlah Tower",
        type: "number",
        required: true,
      },
      {
        name: "unitType",
        label: "Tipe Unit",
        type: "text",
        required: true,
      },
      {
        name: "floor",
        label: "Jumlah Lantai",
        type: "number",
        required: true,
      },
      {
        name: "unitCount",
        label: "Jumlah Unit",
        type: "number",
        required: true,
      },
      {
        name: "yearGiven",
        label: "Tahun",
        type: "number",
        required: true,
      },
      {
        name: "latitude",
        label: "Latitude",
        type: "number",
        required: true,
      },
      {
        name: "longitude",
        label: "Longitude",
        type: "number",
        required: true,
      },
      {
        name: "images",
        label: "Gambar Rusun",
        type: "file",
        accept: "image/*",
        multiple: true,
        required: !editingItem,
        helperText: editingItem
          ? "Opsional. Unggah gambar baru jika ingin mengganti gambar lama. Maksimal 2 MB per gambar."
          : "Unggah minimal satu gambar rusun. Maksimal 2 MB per gambar.",
      },
    ],
    [districtOptions, editingItem, regionOptions, villageOptions]
  );

  const initialValues = editingItem
    ? {
        regionId: editingItem.regionId,
        districtId: editingItem.districtId,
        villageId: editingItem.villageId,
        name: editingItem.name,
        address: editingItem.address,
        tower: String(editingItem.tower),
        unitType: editingItem.type,
        floor: String(editingItem.floors),
        unitCount: String(editingItem.units),
        yearGiven: editingItem.yearGiven,
        latitude: String(editingItem.lat),
        longitude: String(editingItem.lng),
        images: [],
      }
    : undefined;

  const rusunList = rusunQuery.data?.items ?? [];
  const rusunMeta = rusunQuery.data?.meta;
  const stats = useMemo(
    () => ({
      totalRusun: rusunMeta?.totalRecords ?? 0,
      totalUnits: rusunList.reduce((sum, item) => sum + item.units, 0),
      totalTower: rusunList.reduce((sum, item) => sum + item.tower, 0),
    }),
    [rusunList, rusunMeta?.totalRecords]
  );

  const refreshRusun = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-rusun"] });
  }, [queryClient]);

  const openEditDialog = useCallback((item: RusunData) => {
    setEditingItem(item);
    setFormErrors({});
    setDraftValues({
      regionId: item.regionId,
      districtId: item.districtId,
      villageId: item.villageId,
      name: item.name,
      address: item.address,
      tower: String(item.tower),
      unitType: item.type,
      floor: String(item.floors),
      unitCount: String(item.units),
      yearGiven: item.yearGiven,
      latitude: String(item.lat),
      longitude: String(item.lng),
      images: [],
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
          label: "Gambar rusun",
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

        const formData = buildRusunFormData(values);

        if (editingItem) {
          await adminFetch(`/api/admin/resources/rusun/${editingItem.id}`, {
            method: "PUT",
            body: formData,
          });
        } else {
          await adminFetch("/api/admin/resources/rusun", {
            method: "POST",
            body: formData,
          });
        }

        await refreshRusun();
        setFormOpen(false);
        setEditingItem(null);
        setDraftValues({});
        toast({
          title: editingItem ? "Data rusun diperbarui" : "Data rusun ditambahkan",
          description: "Perubahan data rusun berhasil disimpan.",
        });
      } catch (error) {
        if (error instanceof AdminApiError) {
          setFormErrors(normalizeAdminFieldErrors(error.details));
        }

        toast({
          title: "Gagal menyimpan data rusun",
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat menyimpan data rusun.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [editingItem, refreshRusun, toast]
  );

  const handleDelete = useCallback(
    async (item: RusunData) => {
      if (!window.confirm(`Hapus data rusun "${item.name}"?`)) {
        return;
      }

      try {
        await adminFetch(`/api/admin/resources/rusun/${item.id}`, {
          method: "DELETE",
        });
        await refreshRusun();
        toast({
          title: "Data rusun dihapus",
          description: "Data rusun berhasil dihapus.",
        });
      } catch (error) {
        toast({
          title: "Gagal menghapus data rusun",
          description:
            error instanceof Error ? error.message : "Permintaan tidak berhasil.",
          variant: "destructive",
        });
      }
    },
    [refreshRusun, toast]
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
    rusunQuery,
    rusunList,
    rusunMeta,
    stats,
    formFields,
    initialValues,
    setDraftValues,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    setCurrentPage,
  };
}
