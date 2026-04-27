"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { type AdminFormValues, type FormFieldDef } from "@/components/admin";
import {
  buildUploadFieldHelperText,
  getFileFormValue,
  getStringFormValue,
} from "@/lib/admin/form";
import { QUERY_CONFIG } from "@/lib/constants";
import {
  fetchBankDesainPage,
  type BankDesainData,
} from "@/services/bank-desain.service";

import { useAdminCrud } from "./use-admin-crud";

const BANK_DESAIN_PAGE_LIMIT = 10;
const EMPTY_BANK_DESAIN_ITEMS: BankDesainData[] = [];

const typeOptions = [
  { value: "Tipe 36", label: "Tipe 36" },
  { value: "Tipe 45", label: "Tipe 45" },
  { value: "Tipe 54", label: "Tipe 54" },
  { value: "Rusun", label: "Rusun" },
];

const frontendTypeToApiType = {
  T36: "Tipe 36",
  T45: "Tipe 45",
  T54: "Tipe 54",
  Rusun: "Rusun",
} as const;

function buildBankDesainFormData(values: AdminFormValues) {
  const formData = new FormData();

  formData.set("name", getStringFormValue(values, "name"));
  formData.set("type", getStringFormValue(values, "type"));
  formData.set("bedroom_count", getStringFormValue(values, "bedroomCount"));
  formData.set("bathroom_count", getStringFormValue(values, "bathroomCount"));
  formData.set("total_area", getStringFormValue(values, "totalArea"));
  formData.set("has_garage", getStringFormValue(values, "hasGarage"));

  for (const image of getFileFormValue(values, "images")) {
    formData.append("images", image);
  }

  for (const file of getFileFormValue(values, "files")) {
    formData.append("files", file);
  }

  return formData;
}
function desainToFormValues(item: BankDesainData): AdminFormValues {
  return {
    name: item.title,
    type:
      frontendTypeToApiType[
        item.type as keyof typeof frontendTypeToApiType
      ] ?? item.type,
    bedroomCount: String(item.bedrooms),
    bathroomCount: String(item.bathrooms),
    totalArea: String(item.area),
    hasGarage: item.terasFeature === "dengan-teras" ? "true" : "false",
    images: [],
    files: [],
  };
}

export function useAdminBankDesainPage() {
  const crud = useAdminCrud<BankDesainData>({
    queryKey: "admin-bank-desain",
    resourcePath: "/api/admin/resources/bank-desain",
    label: "desain",
    buildPayload: buildBankDesainFormData,
    getDeleteLabel: (item) => item.title,
  });

  const desainQuery = useQuery({
    queryKey: ["admin-bank-desain", crud.currentPage],
    queryFn: () =>
      fetchBankDesainPage({
        page: crud.currentPage,
        perPage: BANK_DESAIN_PAGE_LIMIT,
      }),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
    placeholderData: (previousData) => previousData,
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
        name: "type",
        label: "Tipe",
        type: "select",
        required: true,
        options: typeOptions,
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
        accept: "image/*",
        multiple: true,
        required: true,
        helperText: buildUploadFieldHelperText({
          subject: "1 sampai 4 gambar desain",
          mode: crud.editingItem ? "edit" : "create",
          requiresReuploadOnEdit: true,
          validationLabel: "format gambar",
          maxSizeMb: 2,
          totalUploadMb: 4,
        }),
      },
      {
        name: "files",
        label: "File Dokumen",
        type: "file",
        accept: ".pdf,application/pdf",
        multiple: false,
        required: true,
        helperText: buildUploadFieldHelperText({
          subject: "1 dokumen PDF desain",
          mode: crud.editingItem ? "edit" : "create",
          requiresReuploadOnEdit: true,
          validationLabel: "format PDF",
          maxSizeMb: 10,
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
  const typeStats = useMemo(
    () =>
      desainList.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    [desainList]
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
    typeStats,
    formFields,
    initialValues,
    openCreateDialog: crud.openCreateDialog,
    openEditDialog: (item: BankDesainData) =>
      crud.openEditDialog(item, desainToFormValues),
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    handleFormOpenChange: crud.handleFormOpenChange,
    setCurrentPage: crud.setCurrentPage,
  };
}
