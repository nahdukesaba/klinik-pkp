"use client";

import Image from "next/image";

import { Palette } from "lucide-react";

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
import { useAdminBankDesainPage } from "@/hooks/admin/use-admin-bank-desain-page";
import type { BankDesainData } from "@/services/bank-desain.service";

const desainColumns: Column<BankDesainData>[] = [
  {
    key: "title",
    label: "Nama Desain",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-3">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            width={48}
            height={48}
            className="h-12 w-12 flex-shrink-0 rounded-lg border border-border object-cover"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            <Palette className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-foreground break-words">{item.title}</p>
          <p className="text-xs text-muted-foreground">Kode: {item.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: "type",
    label: "Tipe",
    sortable: true,
    render: (item) => (
      <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {item.type}
      </span>
    ),
  },
  {
    key: "bedrooms",
    label: "Kamar",
    sortable: true,
    render: (item) => (
      <span className="text-foreground">
        {item.bedrooms} KT / {item.bathrooms} KM
      </span>
    ),
  },
  {
    key: "area",
    label: "Luas (m2)",
    sortable: true,
    render: (item) => (
      <span className="font-semibold text-foreground">{item.area} m2</span>
    ),
    className: "text-right",
  },
  {
    key: "terasFeature",
    label: "Fitur",
    render: (item) => (
      <span
        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
          item.terasFeature === "dengan-teras"
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "bg-gray-500/15 text-gray-600 dark:text-gray-400"
        }`}
      >
        {item.terasFeature === "dengan-teras" ? "Dengan Teras" : "Tanpa Teras"}
      </span>
    ),
  },
];

export default function AdminBankDesainPage() {
  const {
    canManage,
    formOpen,
    editingItem,
    formErrors,
    isSaving,
    desainQuery,
    desainList,
    desainMeta,
    typeStats,
    formFields,
    initialValues,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    setCurrentPage,
  } = useAdminBankDesainPage();

  if (!canManage) {
    return (
      <AdminAccessDenied description="Modul bank desain hanya dapat dikelola oleh admin." />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Data Bank Desain"
        description="Kelola desain rumah, gambar, dan file dokumen."
        icon={<Palette className="h-5 w-5" />}
        publicHref="/bank-desain"
        createLabel="Tambah Desain"
        onCreate={openCreateDialog}
      />

      <AdminStatsGrid
        items={[
          { label: "Total Desain", value: desainMeta?.totalRecords ?? 0 },
          ...Object.entries(typeStats).map(([type, count]) => ({
            label: `${type} Halaman Ini`,
            value: count,
          })),
        ]}
        columnsClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      />

      {desainQuery.error ? (
        <AdminErrorAlert message={`Gagal memuat data: ${desainQuery.error.message}`} />
      ) : null}

      <AdminDataTable<BankDesainData>
        columns={desainColumns}
        data={desainList}
        searchFields={["title", "type", "code"]}
        searchPlaceholder="Cari desain..."
        actions={[editAction(openEditDialog), deleteAction(handleDelete)]}
        isLoading={desainQuery.isLoading}
        emptyMessage="Belum ada data bank desain."
        pagination={{
          currentPage: desainMeta?.page ?? 1,
          totalPages: desainMeta?.totalPages ?? 1,
          totalItems: desainMeta?.totalRecords ?? desainList.length,
          pageSize: desainMeta?.limit ?? 10,
          onPageChange: setCurrentPage,
        }}
      />

      <AdminFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={editingItem ? "Edit Bank Desain" : "Tambah Bank Desain"}
        description="Lengkapi identitas desain, spesifikasi ruangan, dan file pendukung."
        fields={formFields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Simpan Perubahan" : "Tambah Desain"}
        isLoading={isSaving}
        errors={formErrors}
      />
    </div>
  );
}
