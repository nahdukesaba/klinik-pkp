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
import { fetchBspsPage, type BspsData } from "@/services/bsps.service";

import { useAdminCreateIntent } from "./use-admin-create-intent";

const BSPS_PAGE_LIMIT = 10;

const apiStatusMap = {
  rencana: "Rencana",
  proses: "Dalam Proses",
  selesai: "Selesai",
} as const;

function buildBspsPayload(values: AdminFormValues) {
  return {
    village_id: getStringFormValue(values, "villageId"),
    district_id: getStringFormValue(values, "districtId"),
    region_id: getStringFormValue(values, "regionId"),
    unit_count: getNumberFormValue(values, "unitCount"),
    year_given: getNumberFormValue(values, "yearGiven"),
    status:
      apiStatusMap[
        getStringFormValue(values, "status") as keyof typeof apiStatusMap
      ] ?? "Rencana",
    coordinate: {
      latitude: getNumberFormValue(values, "latitude"),
      longitude: getNumberFormValue(values, "longitude"),
    },
  };
}

export function useAdminBspsPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BspsData | null>(null);
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

  const bspsQuery = useQuery({
    queryKey: ["admin-bsps", currentPage],
    queryFn: () =>
      fetchBspsPage({
        page: currentPage,
        perPage: BSPS_PAGE_LIMIT,
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
        name: "unitCount",
        label: "Alokasi Unit",
        type: "number",
        required: true,
      },
      {
        name: "yearGiven",
        label: "Tahun Bantuan",
        type: "number",
        required: true,
      },
      {
        name: "status",
        label: "Status Progres",
        type: "select",
        required: true,
        options: [
          { value: "rencana", label: "Rencana" },
          { value: "proses", label: "Dalam Proses" },
          { value: "selesai", label: "Selesai" },
        ],
        defaultValue: "rencana",
      },
      {
        name: "latitude",
        label: "Latitude",
        type: "number",
        required: true,
        placeholder: "Contoh: 2.0154",
      },
      {
        name: "longitude",
        label: "Longitude",
        type: "number",
        required: true,
        placeholder: "Contoh: 98.9309",
      },
    ],
    [districtOptions, regionOptions, villageOptions]
  );

  const initialValues = editingItem
    ? {
        regionId: editingItem.regionId,
        districtId: editingItem.districtId,
        villageId: editingItem.villageId,
        unitCount: String(editingItem.alokasiUnit),
        yearGiven: String(editingItem.yearGiven),
        status: editingItem.status,
        latitude: String(editingItem.coordinates[0]),
        longitude: String(editingItem.coordinates[1]),
      }
    : undefined;

  const bspsList = bspsQuery.data?.items ?? [];
  const bspsMeta = bspsQuery.data?.meta;
  const stats = useMemo(
    () => ({
      totalLokasi: bspsMeta?.totalRecords ?? 0,
      totalUnit: bspsList.reduce((sum, item) => sum + item.alokasiUnit, 0),
      selesai: bspsList.filter((item) => item.status === "selesai").length,
      proses: bspsList.filter((item) => item.status === "proses").length,
    }),
    [bspsList, bspsMeta?.totalRecords]
  );

  const refreshBsps = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-bsps"] });
  }, [queryClient]);

  const openEditDialog = useCallback((item: BspsData) => {
    setEditingItem(item);
    setFormErrors({});
    setDraftValues({
      regionId: item.regionId,
      districtId: item.districtId,
      villageId: item.villageId,
      unitCount: String(item.alokasiUnit),
      yearGiven: String(item.yearGiven),
      status: item.status,
      latitude: String(item.coordinates[0]),
      longitude: String(item.coordinates[1]),
    });
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (values: AdminFormValues) => {
      setIsSaving(true);
      setFormErrors({});

      try {
        const payload = buildBspsPayload(values);

        if (editingItem) {
          await adminFetch(`/api/admin/resources/bsps/${editingItem.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        } else {
          await adminFetch("/api/admin/resources/bsps", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        }

        await refreshBsps();
        setFormOpen(false);
        setEditingItem(null);
        setDraftValues({});
        toast({
          title: editingItem ? "Data BSPS diperbarui" : "Data BSPS ditambahkan",
          description: "Perubahan data BSPS berhasil disimpan.",
        });
      } catch (error) {
        if (error instanceof AdminApiError) {
          setFormErrors(normalizeAdminFieldErrors(error.details));
        }

        toast({
          title: "Gagal menyimpan data BSPS",
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat menyimpan data BSPS.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [editingItem, refreshBsps, toast]
  );

  const handleDelete = useCallback(
    async (item: BspsData) => {
      if (!window.confirm(`Hapus data BSPS untuk ${item.kelurahan || item.nama}?`)) {
        return;
      }

      try {
        await adminFetch(`/api/admin/resources/bsps/${item.id}`, {
          method: "DELETE",
        });
        await refreshBsps();
        toast({
          title: "Data BSPS dihapus",
          description: "Data lokasi BSPS berhasil dihapus.",
        });
      } catch (error) {
        toast({
          title: "Gagal menghapus data BSPS",
          description:
            error instanceof Error ? error.message : "Permintaan tidak berhasil.",
          variant: "destructive",
        });
      }
    },
    [refreshBsps, toast]
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
    bspsQuery,
    bspsList,
    bspsMeta,
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
