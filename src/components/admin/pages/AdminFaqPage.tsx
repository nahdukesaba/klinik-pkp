"use client";

import { HelpCircle } from "lucide-react";

import {
  AdminAccessDenied,
  AdminDataTable,
  AdminErrorAlert,
  AdminFormDialog,
  AdminPageHeader,
  AdminStatsGrid,
  deleteAction,
  editAction,
  type Column,
} from "@/components/admin";
import { useAdminFaqPage } from "@/hooks/admin/use-admin-faq-page";
import { formatDateId } from "@/lib/date";
import type { FaqItem } from "@/services/faq.service";

function getAnswerPreview(answer: string, maxLength = 160) {
  const compact = answer.replace(/\s+/g, " ").trim();

  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength).trimEnd()}...`;
}

const faqColumns: Column<FaqItem>[] = [
  {
    key: "question",
    label: "Pertanyaan",
    sortable: true,
    render: (item) => (
      <div>
        <p className="font-medium text-foreground">{item.question}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Diperbarui {formatDateId(item.updatedAt)}
        </p>
      </div>
    ),
  },
  {
    key: "answer",
    label: "Jawaban",
    render: (item) => (
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        {getAnswerPreview(item.answer)}
      </p>
    ),
  },
];

export default function AdminFaqPage() {
  const {
    canManage,
    formOpen,
    editingItem,
    formErrors,
    isSaving,
    faqQuery,
    faqList,
    stats,
    formFields,
    initialValues,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
  } = useAdminFaqPage();

  if (!canManage) {
    return (
      <AdminAccessDenied description="Modul FAQ hanya dapat dikelola oleh admin." />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="FAQ Publik"
        description="Kelola daftar pertanyaan dan jawaban yang tampil di halaman FAQ publik."
        icon={<HelpCircle className="h-5 w-5" />}
        createLabel="Tambah FAQ"
        onCreate={openCreateDialog}
      />

      <AdminStatsGrid
        items={[
          { label: "Total FAQ", value: stats.total },
        ]}
      />

      {faqQuery.error ? (
        <AdminErrorAlert message={`Gagal mengambil data: ${faqQuery.error.message}`} />
      ) : null}

      <AdminDataTable<FaqItem>
        columns={faqColumns}
        data={faqList}
        searchFields={["question", "answer"]}
        searchPlaceholder="Cari pertanyaan atau jawaban FAQ..."
        actions={[editAction(openEditDialog), deleteAction(handleDelete)]}
        isLoading={faqQuery.isLoading}
        emptyMessage="Belum ada FAQ."
      />

      <AdminFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={editingItem ? "Edit FAQ" : "Tambah FAQ"}
        description="Lengkapi pertanyaan, jawaban, dan status publikasi FAQ."
        fields={formFields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Simpan Perubahan" : "Tambah FAQ"}
        isLoading={isSaving}
        errors={formErrors}
      />
    </div>
  );
}
