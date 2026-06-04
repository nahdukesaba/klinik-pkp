"use client";

import { useMemo } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useAdminLocationOptions } from "@/hooks/use-admin-location-options";
import { getNumberFormValue, getStringFormValue } from "@/lib/admin/form";
import {
  ADMIN_QUERY_GC_TIME_MS,
  ADMIN_QUERY_STALE_TIME_MS,
  QUERY_KEYS,
} from "@/lib/constants";
import { ADMIN_RESOURCE_NAMES } from "@/services/admin-resource.service";
import {
  fetchAdminKumuhPage,
  type KawasanKumuhData,
} from "@/services/kawasan-kumuh.service";

import { useAdminCrud } from "./use-admin-crud";
import { useAdminListQuery } from "./use-admin-list-query";

const EMPTY_KAWASAN_KUMUH_ITEMS: KawasanKumuhData[] = [];

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

function kumuhToFormValues(item: KawasanKumuhData): AdminFormValues {
  return {
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
  };
}

export function useAdminKawasanKumuhPage() {
  const listQuery = useAdminListQuery();
  const crud = useAdminCrud<KawasanKumuhData>({
    queryKey: QUERY_KEYS.adminKawasanKumuh,
    relatedQueryKeys: [QUERY_KEYS.publicKawasanKumuh],
    resource: ADMIN_RESOURCE_NAMES.kumuh,
    label: "kawasan",
    buildPayload: buildKumuhPayload,
    getDeleteLabel: (item) => item.name,
  });

  const { regionOptions, districtOptions } = useAdminLocationOptions(
    getStringFormValue(crud.draftValues, "regionId"),
    undefined,
    crud.formOpen && crud.canManage
  );

  const kumuhQuery = useQuery({
    queryKey: [
      QUERY_KEYS.adminKawasanKumuh,
      listQuery.queryParams,
    ],
    queryFn: ({ signal }) =>
      fetchAdminKumuhPage(listQuery.queryParams, { signal }),
    staleTime: ADMIN_QUERY_STALE_TIME_MS,
    gcTime: ADMIN_QUERY_GC_TIME_MS,
    placeholderData: keepPreviousData,
    enabled: crud.canManage,
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

  const initialValues = crud.editingItem
    ? kumuhToFormValues(crud.editingItem)
    : undefined;

  const kumuhList = kumuhQuery.data?.items ?? EMPTY_KAWASAN_KUMUH_ITEMS;
  const kumuhMeta = kumuhQuery.data?.meta;
  const pagination = {
    ...listQuery.tableState,
    currentPage: kumuhMeta?.page ?? listQuery.tableState.currentPage,
    totalPages: kumuhMeta?.totalPages ?? 1,
    totalItems: kumuhMeta?.totalRecords ?? kumuhList.length,
    pageSize: kumuhMeta?.limit ?? listQuery.tableState.pageSize,
  };
  const stats = useMemo(
    () => ({
      totalKawasan: kumuhMeta?.totalRecords ?? kumuhList.length,
      pageLuas: kumuhList.reduce((sum, item) => sum + item.luas, 0),
      pagePenduduk: kumuhList.reduce((sum, item) => sum + item.penduduk, 0),
      pageSedang: kumuhList.filter((item) => item.status === "sedang").length,
      pageRingan: kumuhList.filter((item) => item.status === "ringan").length,
    }),
    [kumuhList, kumuhMeta?.totalRecords]
  );

  return {
    canManage: crud.canManage,
    formOpen: crud.formOpen,
    editingItem: crud.editingItem,
    formErrors: crud.formErrors,
    isSaving: crud.isSaving,
    kumuhQuery,
    kumuhList,
    kumuhMeta,
    stats,
    formFields,
    initialValues,
    setDraftValues: crud.setDraftValues,
    openCreateDialog: crud.openCreateDialog,
    openEditDialog: (item: KawasanKumuhData) =>
      crud.openEditDialog(item, kumuhToFormValues),
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    handleFormOpenChange: crud.handleFormOpenChange,
    pagination,
    searchKeyword: listQuery.searchInput,
    handleSearchChange: listQuery.setSearch,
    resetFilters: listQuery.resetFilters,
  };
}
