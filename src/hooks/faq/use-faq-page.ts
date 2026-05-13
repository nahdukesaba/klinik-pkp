"use client";

import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import {
  DEFAULT_DEBOUNCE_DELAY_MS,
  QUERY_CONFIG,
  QUERY_KEYS,
} from "@/lib/constants";
import { sanitizeInput } from "@/lib/security";
import { fetchPublicFaqList, type FaqItem } from "@/services/faq.service";

const EMPTY_FAQS: FaqItem[] = [];
const FAQS_PER_PAGE = 8;

export function useFaqPage() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.publicFaq],
    queryFn: () => fetchPublicFaqList(),
    ...QUERY_CONFIG,
    staleTime: 0,
  });

  const faqs = query.data ?? EMPTY_FAQS;

  const [searchQuery, setSearchQuery] = useState("");
  const [openItemId, setOpenItemId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(searchQuery, DEFAULT_DEBOUNCE_DELAY_MS);

  const filteredFaqs = useMemo(() => {
    const keyword = sanitizeInput(debouncedSearch).toLowerCase();

    if (!keyword) {
      return faqs;
    }

    return faqs.filter((item) => {
      const question = item.question.toLowerCase();
      const answer = item.answer.toLowerCase();
      return question.includes(keyword) || answer.includes(keyword);
    });
  }, [debouncedSearch, faqs]);

  const pagination = usePagination(filteredFaqs, {
    perPage: FAQS_PER_PAGE,
  });
  const { setCurrentPage } = pagination;

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setOpenItemId(null);
      setCurrentPage(1);
    },
    [setCurrentPage]
  );

  const toggleItem = useCallback((id: number) => {
    setOpenItemId((current) => (current === id ? null : id));
  }, []);

  const resetSearch = useCallback(() => {
    handleSearchChange("");
    setOpenItemId(null);
  }, [handleSearchChange]);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    searchQuery,
    setSearchQuery: handleSearchChange,
    openItemId,
    toggleItem,
    resetSearch,
    paginatedFaqs: pagination.paginatedItems,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    setCurrentPage,
    goToNextPage: pagination.goToNextPage,
    goToPrevPage: pagination.goToPrevPage,
  };
}
