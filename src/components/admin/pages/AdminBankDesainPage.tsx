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
  AdminTableFilters,
  deleteAction,
  editAction,
  type Column,
} from "@/components/admin";
import { useAdminBankDesainPage } from "@/hooks/admin/use-admin-bank-desain-page";
import type { BankDesainData } from "@/services/bank-desain.service";

const ALL_VALUE = "all";

function toSelectValue(value?: string | number | boolean) {
  return value == null ? ALL_VALUE : String(value);
}

const desainColumns: Column<BankDesainData>[] = [
  {
    key: "title",
    label: "Nama Desain",
    sortable: true,
    sortField: "name",
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
    key: "bedrooms",
    label: "Kamar",
    sortable: true,
    sortField: "bedroom_count",
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
    sortField: "total_area",
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
    pagination,
    stats,
    formFields,
    initialValues,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    searchKeyword,
    handleSearchChange,
    filters,
    handleBedroomFilterChange,
    handleBathroomFilterChange,
    handleGarageFilterChange,
    resetFilters,
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
        createLabel="Tambah Desain"
        onCreate={openCreateDialog}
      />

      <AdminStatsGrid
        items={[
          { label: "Total Desain", value: stats.totalDesain },
        ]}
        columnsClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      />

      {desainQuery.error ? (
        <AdminErrorAlert message={`Gagal mengambil data: ${desainQuery.error.message}`} />
      ) : null}

      <AdminTableFilters
        searchValue={searchKeyword}
        searchPlaceholder="Cari desain..."
        onSearchChange={handleSearchChange}
        onReset={resetFilters}
        selects={[
          {
            key: "bedroomCount",
            label: "Kamar Tidur",
            value: toSelectValue(filters.bedroomCount),
            options: [
              { value: ALL_VALUE, label: "Semua Kamar Tidur" },
              { value: "1", label: "1 Kamar Tidur" },
              { value: "2", label: "2 Kamar Tidur" },
              { value: "3", label: "3 Kamar Tidur" },
              { value: "4", label: "4 Kamar Tidur" },
            ],
            onChange: handleBedroomFilterChange,
          },
          {
            key: "bathroomCount",
            label: "Kamar Mandi",
            value: toSelectValue(filters.bathroomCount),
            options: [
              { value: ALL_VALUE, label: "Semua Kamar Mandi" },
              { value: "1", label: "1 Kamar Mandi" },
              { value: "2", label: "2 Kamar Mandi" },
              { value: "3", label: "3 Kamar Mandi" },
              { value: "4", label: "4 Kamar Mandi" },
            ],
            onChange: handleBathroomFilterChange,
          },
          {
            key: "hasGarage",
            label: "Garasi/Teras",
            value: toSelectValue(filters.hasGarage),
            options: [
              { value: ALL_VALUE, label: "Semua" },
              { value: "true", label: "Dengan Garasi/Teras" },
              { value: "false", label: "Tanpa Garasi/Teras" },
            ],
            onChange: handleGarageFilterChange,
          },
        ]}
      />

      <AdminDataTable<BankDesainData>
        columns={desainColumns}
        data={desainList}
        actions={[editAction(openEditDialog), deleteAction(handleDelete)]}
        isLoading={desainQuery.isLoading}
        emptyMessage="Belum ada data bank desain."
        pagination={pagination}
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
