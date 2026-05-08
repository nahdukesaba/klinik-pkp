"use client";

import { HelpCircle } from "lucide-react";

import {
  AdminAccessDenied,
  AdminDataTable,
  AdminErrorAlert,
  AdminFormDialog,
  AdminPageHeader,
  AdminStatsGrid,
  StatusBadge,
  deleteAction,
  editAction,
  type Column,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import {
  type FaqStatusFilter,
  useAdminFaqPage,
} from "@/hooks/admin/use-admin-faq-page";
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
  {
    key: "isActive",
    label: "Status",
    sortable: true,
    render: (item) => (
      <StatusBadge status={item.isActive ? "active" : "inactive"} />
    ),
  },
];

const statusFilterOptions: { label: string; value: FaqStatusFilter }[] = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
];

function FaqStatusFilterBar({
  value,
  onChange,
}: {
  value: FaqStatusFilter;
  onChange: (value: FaqStatusFilter) => void;
}) {
  return (
    <div className="flex w-full gap-2 sm:w-auto" aria-label="Filter status FAQ">
      {statusFilterOptions.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? "default" : "outline"}
          className="min-h-10 flex-1 sm:flex-none"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

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
    statusFilter,
    setStatusFilter,
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
          { label: "Aktif", value: stats.active },
          { label: "Nonaktif", value: stats.inactive },
        ]}
      />

      {faqQuery.error ? (
        <AdminErrorAlert message={`Gagal memuat data: ${faqQuery.error.message}`} />
      ) : null}

      <AdminDataTable<FaqItem>
        columns={faqColumns}
        data={faqList}
        searchFields={["question", "answer"]}
        searchPlaceholder="Cari pertanyaan atau jawaban FAQ..."
        headerActions={
          <FaqStatusFilterBar
            value={statusFilter}
            onChange={setStatusFilter}
          />
        }
        actions={[editAction(openEditDialog), deleteAction(handleDelete)]}
        isLoading={faqQuery.isLoading}
        emptyMessage={
          statusFilter === "all"
            ? "Belum ada FAQ."
            : "Tidak ada FAQ pada status ini."
        }
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
