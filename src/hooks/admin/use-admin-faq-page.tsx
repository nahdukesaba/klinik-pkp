"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useAdminCrud } from "@/hooks/admin/use-admin-crud";
import { useAdminListQuery } from "@/hooks/admin/use-admin-list-query";
import { getStringFormValue } from "@/lib/admin/form";
import {
  ADMIN_QUERY_GC_TIME_MS,
  ADMIN_QUERY_STALE_TIME_MS,
  QUERY_KEYS,
} from "@/lib/constants";
import { ADMIN_RESOURCE_NAMES } from "@/services/admin-resource.service";
import { fetchAdminFaqList, type FaqItem } from "@/services/faq.service";

const EMPTY_FAQ_ITEMS: FaqItem[] = [];
const faqSortCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
});

function getFaqSortValue(item: FaqItem, sortKey: string) {
  return item[sortKey as keyof FaqItem];
}

function compareFaqValues(left: unknown, right: unknown) {
  const leftEmpty = left == null || left === "";
  const rightEmpty = right == null || right === "";

  if (leftEmpty && rightEmpty) return 0;
  if (leftEmpty) return 1;
  if (rightEmpty) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right);
  }

  return faqSortCollator.compare(String(left), String(right));
}

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
    staleTime: ADMIN_QUERY_STALE_TIME_MS,
    gcTime: ADMIN_QUERY_GC_TIME_MS,
    enabled: crud.canManage,
  });

  const faqList = faqQuery.data ?? EMPTY_FAQ_ITEMS;
  const sortedFaqList = useMemo(() => {
    if (!listQuery.sortBy) {
      return faqList;
    }

    return [...faqList].sort((left, right) => {
      const result = compareFaqValues(
        getFaqSortValue(left, listQuery.sortBy as string),
        getFaqSortValue(right, listQuery.sortBy as string)
      );

      return listQuery.sortDirection === "asc" ? result : -result;
    });
  }, [faqList, listQuery.sortBy, listQuery.sortDirection]);
  const totalPages = Math.max(1, Math.ceil(faqList.length / listQuery.pageSize));
  const currentPage = Math.min(listQuery.currentPage, totalPages);
  const pageFaqList = useMemo(() => {
    const start = (currentPage - 1) * listQuery.pageSize;
    return sortedFaqList.slice(start, start + listQuery.pageSize);
  }, [currentPage, listQuery.pageSize, sortedFaqList]);
  const pagination = {
    ...listQuery.tableState,
    currentPage,
    totalPages,
    totalItems: faqList.length,
    pageSize: listQuery.pageSize,
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
