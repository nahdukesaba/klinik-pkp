"use client";

import { useCallback, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminAuth, type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useAdminLocationOptions } from "@/hooks/use-admin-location-options";
import { useToast } from "@/hooks/use-toast";
import { getNumberFormValue, getStringFormValue } from "@/lib/admin/form";
import { canManageContent } from "@/lib/admin/roles";
import {
  AdminApiError,
  adminFetch,
  normalizeAdminFieldErrors,
} from "@/lib/admin-client";
import { QUERY_CONFIG } from "@/lib/constants";
import {
  fetchKumuhPage,
  type KawasanKumuhData,
} from "@/services/kawasan-kumuh.service";

import { useAdminCreateIntent } from "./use-admin-create-intent";

const KUMUH_PAGE_LIMIT = 10;

function buildKumuhPayload(values: AdminFormValues) {
  return {
    district_id: getStringFormValue(values, "districtId"),
    region_id: getStringFormValue(values, "regionId"),
    area_name: getStringFormValue(values, "areaName"),
    environments: getStringFormValue(values, "environments"),
    villages: getStringFormValue(values, "villages"),
    total_area: getNumberFormValue(values, "totalArea"),
    total_population: getNumberFormValue(values, "totalPopulation"),
    slum_value: getNumberFormValue(values, "slumValue"),
    year_inspected: getNumberFormValue(values, "yearInspected"),
    coordinate: {
      latitude: getNumberFormValue(values, "latitude"),
      longitude: getNumberFormValue(values, "longitude"),
    },
  };
}

export function useAdminKawasanKumuhPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KawasanKumuhData | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftValues, setDraftValues] = useState<AdminFormValues>({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const canManage = canManageContent(user.role);
  const { regionOptions, districtOptions } = useAdminLocationOptions(
    getStringFormValue(draftValues, "regionId"),
    undefined,
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

  const kumuhQuery = useQuery({
    queryKey: ["admin-kawasan-kumuh", currentPage],
    queryFn: () =>
      fetchKumuhPage({
        page: currentPage,
        perPage: KUMUH_PAGE_LIMIT,
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
        name: "areaName",
        label: "Nama Kawasan",
        type: "text",
        required: true,
        placeholder: "Contoh: Kawasan Kumuh Baru",
      },
      {
        name: "environments",
        label: "Lingkungan",
        type: "textarea",
        required: true,
        placeholder: "Pisahkan dengan koma jika lebih dari satu",
      },
      {
        name: "villages",
        label: "Desa/Kelurahan",
        type: "textarea",
        required: true,
        placeholder: "Contoh: Desa A, Desa B",
      },
      {
        name: "totalArea",
        label: "Luas Kawasan (Ha)",
        type: "number",
        required: true,
      },
      {
        name: "totalPopulation",
        label: "Total Penduduk",
        type: "number",
        required: true,
      },
      {
        name: "slumValue",
        label: "Nilai Kekumuhan",
        type: "number",
        required: true,
        helperText:
          "Gunakan skor penilaian untuk menentukan kategori ringan, sedang, atau berat.",
      },
      {
        name: "yearInspected",
        label: "Tahun Inspeksi",
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
    ],
    [districtOptions, regionOptions]
  );

  const initialValues = editingItem
    ? {
        regionId: editingItem.regionId,
        districtId: editingItem.districtId,
        areaName: editingItem.name,
        environments: editingItem.lingkunganText,
        villages: editingItem.villagesText,
        totalArea: String(editingItem.luas),
        totalPopulation: String(editingItem.penduduk),
        slumValue: String(editingItem.slumValue),
        yearInspected: String(editingItem.yearInspected),
        latitude: String(editingItem.lat),
        longitude: String(editingItem.lng),
      }
    : undefined;

  const kumuhList = kumuhQuery.data?.items ?? [];
  const kumuhMeta = kumuhQuery.data?.meta;
  const stats = useMemo(
    () => ({
      totalKawasan: kumuhMeta?.totalRecords ?? 0,
      totalLuas: kumuhList.reduce((sum, item) => sum + item.luas, 0),
      totalPenduduk: kumuhList.reduce((sum, item) => sum + item.penduduk, 0),
      berat: kumuhList.filter((item) => item.status === "berat").length,
      sedang: kumuhList.filter((item) => item.status === "sedang").length,
      ringan: kumuhList.filter((item) => item.status === "ringan").length,
    }),
    [kumuhList, kumuhMeta?.totalRecords]
  );

  const refreshKumuh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-kawasan-kumuh"] });
  }, [queryClient]);

  const openEditDialog = useCallback((item: KawasanKumuhData) => {
    setEditingItem(item);
    setFormErrors({});
    setDraftValues({
      regionId: item.regionId,
      districtId: item.districtId,
      areaName: item.name,
      environments: item.lingkunganText,
      villages: item.villagesText,
      totalArea: String(item.luas),
      totalPopulation: String(item.penduduk),
      slumValue: String(item.slumValue),
      yearInspected: String(item.yearInspected),
      latitude: String(item.lat),
      longitude: String(item.lng),
    });
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (values: AdminFormValues) => {
      setIsSaving(true);
      setFormErrors({});

      try {
        const payload = buildKumuhPayload(values);

        if (editingItem) {
          await adminFetch(`/api/admin/resources/kumuh/${editingItem.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        } else {
          await adminFetch("/api/admin/resources/kumuh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        }

        await refreshKumuh();
        setFormOpen(false);
        setEditingItem(null);
        setDraftValues({});
        toast({
          title: editingItem
            ? "Data kawasan diperbarui"
            : "Data kawasan ditambahkan",
          description: "Perubahan kawasan kumuh berhasil disimpan.",
        });
      } catch (error) {
        if (error instanceof AdminApiError) {
          setFormErrors(normalizeAdminFieldErrors(error.details));
        }

        toast({
          title: "Gagal menyimpan data kawasan",
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat menyimpan data kawasan.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [editingItem, refreshKumuh, toast]
  );

  const handleDelete = useCallback(
    async (item: KawasanKumuhData) => {
      if (!window.confirm(`Hapus kawasan "${item.name}"?`)) {
        return;
      }

      try {
        await adminFetch(`/api/admin/resources/kumuh/${item.id}`, {
          method: "DELETE",
        });
        await refreshKumuh();
        toast({
          title: "Data kawasan dihapus",
          description: "Data kawasan kumuh berhasil dihapus.",
        });
      } catch (error) {
        toast({
          title: "Gagal menghapus kawasan",
          description:
            error instanceof Error ? error.message : "Permintaan tidak berhasil.",
          variant: "destructive",
        });
      }
    },
    [refreshKumuh, toast]
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
    kumuhQuery,
    kumuhList,
    kumuhMeta,
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
