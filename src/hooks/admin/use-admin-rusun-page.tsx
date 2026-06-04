"use client";

import { useMemo } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useAdminLocationOptions } from "@/hooks/use-admin-location-options";
import {
  buildExistingUploadFiles,
  buildUploadFieldHelperText,
  getExistingFileFormValue,
  getFileFormValue,
  getNumberFormValue,
  getStringFormValue,
} from "@/lib/admin/form";
import {
  ADMIN_QUERY_GC_TIME_MS,
  ADMIN_QUERY_STALE_TIME_MS,
  QUERY_KEYS,
  UPLOAD_CONSTRAINTS,
} from "@/lib/constants";
import { ADMIN_RESOURCE_NAMES } from "@/services/admin-resource.service";
import {
  fetchAdminRusunPage,
  type RusunData,
} from "@/services/rusun.service";

import { useAdminCrud } from "./use-admin-crud";
import { useAdminListQuery } from "./use-admin-list-query";

const EMPTY_RUSUN_ITEMS: RusunData[] = [];

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

  const imageFiles = getFileFormValue(values, "images");
  for (const file of imageFiles) {
    formData.append("images", file);
  }

  const existingImages = getExistingFileFormValue(values, "images");
  if (existingImages && imageFiles.length === 0) {
    formData.set("existing_images", existingImages);
  }

  return formData;
}

function rusunToFormValues(item: RusunData): AdminFormValues {
  return {
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
  };
}

export function useAdminRusunPage() {
  const listQuery = useAdminListQuery();
  const crud = useAdminCrud<RusunData>({
    queryKey: QUERY_KEYS.adminRusun,
    relatedQueryKeys: [QUERY_KEYS.publicRusun],
    resource: ADMIN_RESOURCE_NAMES.rusun,
    label: "rusun",
    buildPayload: buildRusunFormData,
    getDeleteLabel: (item) => item.name,
  });

  const { regionOptions, districtOptions, villageOptions } =
    useAdminLocationOptions(
      getStringFormValue(crud.draftValues, "regionId"),
      getStringFormValue(crud.draftValues, "districtId"),
      crud.formOpen && crud.canManage
    );

  const rusunQuery = useQuery({
    queryKey: [
      QUERY_KEYS.adminRusun,
      listQuery.queryParams,
    ],
    queryFn: ({ signal }) =>
      fetchAdminRusunPage(listQuery.queryParams, { signal }),
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
        accept: UPLOAD_CONSTRAINTS.singleImage.accept,
        multiple: false,
        maxFiles: UPLOAD_CONSTRAINTS.singleImage.maxFiles,
        maxSizeMb: UPLOAD_CONSTRAINTS.singleImage.maxSizeMb,
        required: !crud.editingItem,
        existingFiles: crud.editingItem
          ? buildExistingUploadFiles([crud.editingItem.image], "Gambar")
          : undefined,
        helperText: buildUploadFieldHelperText({
          subject: "1 gambar rusun",
          mode: crud.editingItem ? "edit" : "create",
          optional: Boolean(crud.editingItem),
          validationLabel: "format gambar",
          maxSizeMb: UPLOAD_CONSTRAINTS.singleImage.maxSizeMb,
        }),
      },
    ],
    [crud.editingItem, districtOptions, regionOptions, villageOptions]
  );

  const initialValues = crud.editingItem
    ? rusunToFormValues(crud.editingItem)
    : undefined;

  const rusunList = rusunQuery.data?.items ?? EMPTY_RUSUN_ITEMS;
  const rusunMeta = rusunQuery.data?.meta;
  const pagination = {
    ...listQuery.tableState,
    currentPage: rusunMeta?.page ?? listQuery.tableState.currentPage,
    totalPages: rusunMeta?.totalPages ?? 1,
    totalItems: rusunMeta?.totalRecords ?? rusunList.length,
    pageSize: rusunMeta?.limit ?? listQuery.tableState.pageSize,
  };
  const stats = useMemo(
    () => ({
      totalRusun: rusunMeta?.totalRecords ?? rusunList.length,
      pageUnits: rusunList.reduce((sum, item) => sum + item.units, 0),
    }),
    [rusunList, rusunMeta?.totalRecords]
  );

  return {
    canManage: crud.canManage,
    formOpen: crud.formOpen,
    editingItem: crud.editingItem,
    formErrors: crud.formErrors,
    isSaving: crud.isSaving,
    rusunQuery,
    rusunList,
    rusunMeta,
    stats,
    formFields,
    initialValues,
    setDraftValues: crud.setDraftValues,
    openCreateDialog: crud.openCreateDialog,
    openEditDialog: (item: RusunData) =>
      crud.openEditDialog(item, rusunToFormValues),
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    handleFormOpenChange: crud.handleFormOpenChange,
    pagination,
    resetFilters: listQuery.resetFilters,
  };
}
