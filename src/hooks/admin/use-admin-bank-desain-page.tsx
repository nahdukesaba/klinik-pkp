"use client";

import { useCallback, useMemo } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { type AdminFormValues, type FormFieldDef } from "@/components/admin";
import {
  buildExistingUploadFiles,
  buildUploadFieldHelperText,
  getExistingFileFormValue,
  getFileFormValue,
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
  fetchAdminBankDesainPage,
  type BankDesainData,
} from "@/services/bank-desain.service";

import { useAdminCrud } from "./use-admin-crud";
import { useAdminListQuery } from "./use-admin-list-query";

const EMPTY_BANK_DESAIN_ITEMS: BankDesainData[] = [];
const BANK_DESAIN_TYPE = "Tipe 36";

type BankDesainAdminFilters = {
  bedroomCount?: number;
  bathroomCount?: number;
  hasGarage?: boolean;
};

function buildBankDesainFormData(values: AdminFormValues) {
  const formData = new FormData();

  formData.set("name", getStringFormValue(values, "name"));
  formData.set("type", BANK_DESAIN_TYPE);
  formData.set("bedroom_count", getStringFormValue(values, "bedroomCount"));
  formData.set("bathroom_count", getStringFormValue(values, "bathroomCount"));
  formData.set("total_area", getStringFormValue(values, "totalArea"));
  formData.set("has_garage", getStringFormValue(values, "hasGarage"));

  for (const image of getFileFormValue(values, "images")) {
    formData.append("images", image);
  }

  const rabFiles = getFileFormValue(values, "files");
  for (const file of rabFiles) {
    formData.append("files", file);
  }

  const existingImages = getExistingFileFormValue(values, "images");
  if (existingImages) {
    formData.set("existing_images", existingImages);
  }

  const existingFiles = getExistingFileFormValue(values, "files");
  if (existingFiles && rabFiles.length === 0) {
    formData.set("existing_files", existingFiles);
  }

  return formData;
}
function desainToFormValues(item: BankDesainData): AdminFormValues {
  return {
    name: item.title,
    bedroomCount: String(item.bedrooms),
    bathroomCount: String(item.bathrooms),
    totalArea: String(item.area),
    hasGarage: item.terasFeature === "dengan-teras" ? "true" : "false",
    images: [],
    files: [],
  };
}

export function useAdminBankDesainPage() {
  const listQuery = useAdminListQuery<BankDesainAdminFilters>();
  const { filters, setFilter } = listQuery;
  const crud = useAdminCrud<BankDesainData>({
    queryKey: QUERY_KEYS.adminBankDesain,
    relatedQueryKeys: [QUERY_KEYS.publicBankDesain],
    resource: ADMIN_RESOURCE_NAMES.bankDesain,
    label: "desain",
    buildPayload: buildBankDesainFormData,
    getDeleteLabel: (item) => item.title,
  });

  const desainQuery = useQuery({
    queryKey: [
      QUERY_KEYS.adminBankDesain,
      listQuery.queryParams,
    ],
    queryFn: ({ signal }) =>
      fetchAdminBankDesainPage(listQuery.queryParams, { signal }),
    staleTime: ADMIN_QUERY_STALE_TIME_MS,
    gcTime: ADMIN_QUERY_GC_TIME_MS,
    placeholderData: keepPreviousData,
    enabled: crud.canManage,
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
        accept: UPLOAD_CONSTRAINTS.designImages.accept,
        multiple: true,
        maxFiles: UPLOAD_CONSTRAINTS.designImages.maxFiles,
        maxSizeMb: UPLOAD_CONSTRAINTS.designImages.maxSizeMb,
        maxTotalSizeMb: UPLOAD_CONSTRAINTS.designImages.maxTotalSizeMb,
        required: !crud.editingItem,
        existingFiles: crud.editingItem
          ? buildExistingUploadFiles(crud.editingItem.previewImages, "Gambar")
          : undefined,
        helperText: buildUploadFieldHelperText({
          subject: "1 sampai 4 gambar desain",
          mode: crud.editingItem ? "edit" : "create",
          optional: Boolean(crud.editingItem),
          validationLabel: "format gambar",
          maxSizeMb: UPLOAD_CONSTRAINTS.designImages.maxSizeMb,
          totalUploadMb: UPLOAD_CONSTRAINTS.designImages.maxTotalSizeMb,
        }),
      },
      {
        name: "files",
        label: "File RAB (PDF)",
        type: "file",
        accept: UPLOAD_CONSTRAINTS.rabPdf.accept,
        multiple: false,
        maxFiles: UPLOAD_CONSTRAINTS.rabPdf.maxFiles,
        maxSizeMb: UPLOAD_CONSTRAINTS.rabPdf.maxSizeMb,
        required: !crud.editingItem,
        existingFiles: crud.editingItem
          ? buildExistingUploadFiles([crud.editingItem.rabPdfUrl], "Dokumen")
          : undefined,
        helperText: buildUploadFieldHelperText({
          subject: "1 dokumen PDF desain",
          mode: crud.editingItem ? "edit" : "create",
          optional: Boolean(crud.editingItem),
          validationLabel: "format PDF",
          maxSizeMb: UPLOAD_CONSTRAINTS.rabPdf.maxSizeMb,
        }),
      },
    ],
    [crud.editingItem]
  );

  const initialValues = crud.editingItem
    ? desainToFormValues(crud.editingItem)
    : undefined;

  const desainList = desainQuery.data?.items ?? EMPTY_BANK_DESAIN_ITEMS;
  const desainMeta = desainQuery.data?.meta;
  const pagination = {
    ...listQuery.tableState,
    currentPage: desainMeta?.page ?? listQuery.tableState.currentPage,
    totalPages: desainMeta?.totalPages ?? 1,
    totalItems: desainMeta?.totalRecords ?? desainList.length,
    pageSize: desainMeta?.limit ?? listQuery.tableState.pageSize,
  };
  const handleBedroomFilterChange = useCallback(
    (value: string) => {
      const bedroomCount = Number(value);
      setFilter(
        "bedroomCount",
        Number.isFinite(bedroomCount) ? bedroomCount : undefined
      );
    },
    [setFilter]
  );
  const handleBathroomFilterChange = useCallback(
    (value: string) => {
      const bathroomCount = Number(value);
      setFilter(
        "bathroomCount",
        Number.isFinite(bathroomCount) ? bathroomCount : undefined
      );
    },
    [setFilter]
  );
  const handleGarageFilterChange = useCallback(
    (value: string) => {
      setFilter(
        "hasGarage",
        value === "true" ? true : value === "false" ? false : undefined
      );
    },
    [setFilter]
  );
  const stats = useMemo(
    () => ({
      totalDesain: desainMeta?.totalRecords ?? desainList.length,
    }),
    [desainList.length, desainMeta?.totalRecords]
  );

  return {
    canManage: crud.canManage,
    formOpen: crud.formOpen,
    editingItem: crud.editingItem,
    formErrors: crud.formErrors,
    isSaving: crud.isSaving,
    desainQuery,
    desainList,
    desainMeta,
    stats,
    formFields,
    initialValues,
    openCreateDialog: crud.openCreateDialog,
    openEditDialog: (item: BankDesainData) =>
      crud.openEditDialog(item, desainToFormValues),
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    handleFormOpenChange: crud.handleFormOpenChange,
    pagination,
    searchKeyword: listQuery.searchInput,
    handleSearchChange: listQuery.setSearch,
    filters,
    handleBedroomFilterChange,
    handleBathroomFilterChange,
    handleGarageFilterChange,
    resetFilters: listQuery.resetFilters,
  };
}
