"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useAdminCrud } from "@/hooks/admin/use-admin-crud";
import { useAdminListQuery } from "@/hooks/admin/use-admin-list-query";
import { getStringFormValue } from "@/lib/admin/form";
import { QUERY_CONFIG, QUERY_KEYS } from "@/lib/constants";
import { ADMIN_RESOURCE_NAMES } from "@/services/admin-resource.service";
import { fetchAdminFaqList, type FaqItem } from "@/services/faq.service";

const EMPTY_FAQ_ITEMS: FaqItem[] = [];

function buildFaqPayload(values: AdminFormValues) {
  return {
    question: getStringFormValue(values, "question").trim(),
    answer: getStringFormValue(values, "answer").trim(),
    is_active: true,
  };
}

function faqToFormValues(item: FaqItem): AdminFormValues {
  return {
    question: item.question,
    answer: item.answer,
  };
}

export function useAdminFaqPage() {
  const listQuery = useAdminListQuery();
  const crud = useAdminCrud<FaqItem>({
    queryKey: QUERY_KEYS.adminFaq,
    relatedQueryKeys: [QUERY_KEYS.publicFaq],
    resource: ADMIN_RESOURCE_NAMES.faq,
    label: "FAQ",
    buildPayload: buildFaqPayload,
    getDeleteLabel: (item) => item.question,
  });

  const faqQuery = useQuery({
    queryKey: [QUERY_KEYS.adminFaq, listQuery.queryParams.keyword],
    queryFn: () =>
      fetchAdminFaqList({
        includeInactive: true,
        search: listQuery.queryParams.keyword,
      }),
    staleTime: 0,
    gcTime: QUERY_CONFIG.gcTime,
    enabled: crud.canManage,
  });

  const faqList = faqQuery.data ?? EMPTY_FAQ_ITEMS;
  const totalPages = Math.max(1, Math.ceil(faqList.length / listQuery.pageSize));
  const currentPage = Math.min(listQuery.currentPage, totalPages);
  const pageFaqList = useMemo(() => {
    const start = (currentPage - 1) * listQuery.pageSize;
    return faqList.slice(start, start + listQuery.pageSize);
  }, [currentPage, faqList, listQuery.pageSize]);
  const pagination = {
    ...listQuery.tableState,
    currentPage,
    totalPages,
    totalItems: faqList.length,
    pageSize: listQuery.pageSize,
    onSortChange: undefined,
  };

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
    ],
    []
  );

  const stats = useMemo(
    () => ({
      total: faqList.length,
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
    faqList: pageFaqList,
    pagination,
    stats,
    formFields,
    initialValues,
    openCreateDialog: crud.openCreateDialog,
    openEditDialog: (item: FaqItem) => crud.openEditDialog(item, faqToFormValues),
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    handleFormOpenChange: crud.handleFormOpenChange,
    searchKeyword: listQuery.searchInput,
    handleSearchChange: listQuery.setSearch,
    resetFilters: listQuery.resetFilters,
  };
}
