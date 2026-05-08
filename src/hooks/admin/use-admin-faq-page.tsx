"use client";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useAdminCrud } from "@/hooks/admin/use-admin-crud";
import { getStringFormValue } from "@/lib/admin/form";
import { QUERY_CONFIG } from "@/lib/constants";
import { fetchAdminFaqList, type FaqItem } from "@/services/faq.service";

const EMPTY_FAQ_ITEMS: FaqItem[] = [];
export type FaqStatusFilter = "all" | "active" | "inactive";

function buildFaqPayload(values: AdminFormValues) {
  const status = getStringFormValue(values, "isActive");
  const isActive = status !== "inactive" && status !== "false";

  return {
    question: getStringFormValue(values, "question").trim(),
    answer: getStringFormValue(values, "answer").trim(),
    is_active: isActive,
  };
}

function faqToFormValues(item: FaqItem): AdminFormValues {
  return {
    question: item.question,
    answer: item.answer,
    isActive: item.isActive ? "active" : "inactive",
  };
}

export function useAdminFaqPage() {
  const [statusFilter, setStatusFilter] = useState<FaqStatusFilter>("all");

  const crud = useAdminCrud<FaqItem>({
    queryKey: "admin-faq",
    relatedQueryKeys: ["faq-public"],
    resourcePath: "/api/admin/resources/faq",
    label: "FAQ",
    buildPayload: buildFaqPayload,
    getDeleteLabel: (item) => item.question,
  });

  const faqQuery = useQuery({
    queryKey: ["admin-faq"] as const,
    queryFn: () => fetchAdminFaqList({ includeInactive: true }),
    staleTime: 0,
    gcTime: QUERY_CONFIG.gcTime,
    enabled: crud.canManage,
  });

  const faqList = faqQuery.data ?? EMPTY_FAQ_ITEMS;

  const filteredFaqList = useMemo(() => {
    if (statusFilter === "active") {
      return faqList.filter((item) => item.isActive);
    }

    if (statusFilter === "inactive") {
      return faqList.filter((item) => !item.isActive);
    }

    return faqList;
  }, [faqList, statusFilter]);

  const formFields = useMemo<FormFieldDef[]>(
    () => [
      {
        name: "question",
        label: "Pertanyaan",
        type: "textarea",
        required: true,
        placeholder: "Tuliskan pertanyaan yang akan tampil di halaman FAQ.",
      },
      {
        name: "answer",
        label: "Jawaban",
        type: "textarea",
        required: true,
        placeholder: "Tuliskan jawaban yang jelas dan mudah dipahami.",
      },
      {
        name: "isActive",
        label: "Status Publikasi",
        type: "select",
        required: true,
        defaultValue: "active",
        options: [
          { value: "active", label: "Aktif" },
          { value: "inactive", label: "Nonaktif" },
        ],
      },
    ],
    []
  );

  const stats = useMemo(
    () => ({
      total: faqList.length,
      active: faqList.filter((item) => item.isActive).length,
      inactive: faqList.filter((item) => !item.isActive).length,
    }),
    [faqList]
  );

  const initialValues = crud.editingItem
    ? faqToFormValues(crud.editingItem)
    : undefined;

  return {
    canManage: crud.canManage,
    formOpen: crud.formOpen,
    editingItem: crud.editingItem,
    formErrors: crud.formErrors,
    isSaving: crud.isSaving,
    faqQuery,
    faqList: filteredFaqList,
    statusFilter,
    setStatusFilter,
    stats,
    formFields,
    initialValues,
    openCreateDialog: crud.openCreateDialog,
    openEditDialog: (item: FaqItem) => crud.openEditDialog(item, faqToFormValues),
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    handleFormOpenChange: crud.handleFormOpenChange,
  };
}
