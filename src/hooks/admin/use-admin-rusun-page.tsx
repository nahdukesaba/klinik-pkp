"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

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
import { QUERY_CONFIG } from "@/lib/constants";
import {
  fetchRusunPage,
  type RusunData,
} from "@/services/rusun.service";

import { useAdminCrud } from "./use-admin-crud";

const RUSUN_PAGE_LIMIT = 10;
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

  for (const file of getFileFormValue(values, "images")) {
    formData.append("images", file);
  }

  const existingImages = getExistingFileFormValue(values, "images");
  if (existingImages) {
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
  const crud = useAdminCrud<RusunData>({
    queryKey: "admin-rusun",
    resourcePath: "/api/admin/resources/rusun",
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
    queryKey: ["admin-rusun", crud.currentPage],
    queryFn: () =>
      fetchRusunPage({
        page: crud.currentPage,
        perPage: RUSUN_PAGE_LIMIT,
      }),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
    placeholderData: (previousData) => previousData,
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
        accept: "image/*",
        multiple: false,
        required: !crud.editingItem,
        existingFiles: crud.editingItem
          ? buildExistingUploadFiles([crud.editingItem.image], "Gambar")
          : undefined,
        helperText: buildUploadFieldHelperText({
          subject: "1 gambar rusun",
          mode: crud.editingItem ? "edit" : "create",
          requiresReuploadOnEdit: true,
          validationLabel: "format gambar",
          maxSizeMb: 2,
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
  const stats = useMemo(
    () => ({
      totalRusun: rusunMeta?.totalRecords ?? rusunList.length,
    }),
    [rusunList.length, rusunMeta?.totalRecords]
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
    setCurrentPage: crud.setCurrentPage,
  };
}
