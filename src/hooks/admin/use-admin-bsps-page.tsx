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
  fetchAdminBspsPage,
  type BspsData,
} from "@/services/bsps.service";

import { useAdminCrud } from "./use-admin-crud";
import { useAdminListQuery } from "./use-admin-list-query";

const EMPTY_BSPS_ITEMS: BspsData[] = [];

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

function bspsToFormValues(item: BspsData): AdminFormValues {
  return {
    regionId: item.regionId,
    districtId: item.districtId,
    villageId: item.villageId,
    unitCount: String(item.alokasiUnit),
    yearGiven: String(item.yearGiven),
    status: item.status,
    latitude: String(item.coordinates[0]),
    longitude: String(item.coordinates[1]),
  };
}

export function useAdminBspsPage() {
  const listQuery = useAdminListQuery();
  const crud = useAdminCrud<BspsData>({
    queryKey: QUERY_KEYS.adminBsps,
    relatedQueryKeys: [QUERY_KEYS.publicBsps],
    resource: ADMIN_RESOURCE_NAMES.bsps,
    label: "BSPS",
    buildPayload: buildBspsPayload,
    getDeleteLabel: (item) => item.kelurahan || item.nama,
  });

  const { regionOptions, districtOptions, villageOptions } =
    useAdminLocationOptions(
      getStringFormValue(crud.draftValues, "regionId"),
      getStringFormValue(crud.draftValues, "districtId"),
      crud.formOpen && crud.canManage
    );

  const bspsQuery = useQuery({
    queryKey: [
      QUERY_KEYS.adminBsps,
      listQuery.queryParams,
    ],
    queryFn: ({ signal }) =>
      fetchAdminBspsPage(listQuery.queryParams, { signal }),
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

  const initialValues = crud.editingItem
    ? bspsToFormValues(crud.editingItem)
    : undefined;

  const bspsList = bspsQuery.data?.items ?? EMPTY_BSPS_ITEMS;
  const bspsMeta = bspsQuery.data?.meta;
  const pagination = {
    ...listQuery.tableState,
    currentPage: bspsMeta?.page ?? listQuery.tableState.currentPage,
    totalPages: bspsMeta?.totalPages ?? 1,
    totalItems: bspsMeta?.totalRecords ?? bspsList.length,
    pageSize: bspsMeta?.limit ?? listQuery.tableState.pageSize,
  };
  const stats = useMemo(
    () => ({
      totalLokasi: bspsMeta?.totalRecords ?? bspsList.length,
      pageUnit: bspsList.reduce((sum, item) => sum + item.alokasiUnit, 0),
      pageSelesai: bspsList.filter((item) => item.status === "selesai").length,
      pageProses: bspsList.filter((item) => item.status === "proses").length,
      pageRencana: bspsList.filter((item) => item.status === "rencana").length,
    }),
    [bspsList, bspsMeta?.totalRecords]
  );

  return {
    canManage: crud.canManage,
    formOpen: crud.formOpen,
    editingItem: crud.editingItem,
    formErrors: crud.formErrors,
    isSaving: crud.isSaving,
    bspsQuery,
    bspsList,
    bspsMeta,
    stats,
    formFields,
    initialValues,
    setDraftValues: crud.setDraftValues,
    openCreateDialog: crud.openCreateDialog,
    openEditDialog: (item: BspsData) =>
      crud.openEditDialog(item, bspsToFormValues),
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    handleFormOpenChange: crud.handleFormOpenChange,
    pagination,
    resetFilters: listQuery.resetFilters,
  };
}
