"use client";

import { Building2 } from "lucide-react";

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
import { useAdminRusunPage } from "@/hooks/admin/use-admin-rusun-page";
import type { RusunData } from "@/services/rusun.service";

const rusunColumns: Column<RusunData>[] = [
  {
    key: "name",
    label: "Nama Rusun",
    sortable: true,
    sortField: "name",
    render: (item) => (
      <div className="max-w-[250px]">
        <p className="font-medium text-foreground break-words">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground break-words">
          {item.address}
        </p>
      </div>
    ),
  },
  {
    key: "kabupaten",
    label: "Kabupaten/Kota",
    sortable: true,
    sortField: "region_id",
  },
  {
    key: "tower",
    label: "Tower",
    sortable: true,
    sortField: "tower",
    className: "text-center",
  },
  {
    key: "units",
    label: "Unit",
    sortable: true,
    sortField: "unit_count",
    render: (item) => <span className="font-semibold">{item.units} unit</span>,
    className: "text-right",
  },
  {
    key: "floors",
    label: "Lantai",
    sortable: true,
    sortField: "floor",
    className: "text-center",
  },
  {
    key: "yearGiven",
    label: "Tahun",
    sortable: true,
    sortField: "year_given",
    className: "text-center",
  },
  {
    key: "type",
    label: "Tipe",
    render: (item) => (
      <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {item.type}
      </span>
    ),
  },
];

export default function AdminRusunPage() {
  const {
    canManage,
    formOpen,
    editingItem,
    formErrors,
    isSaving,
    rusunQuery,
    rusunList,
    rusunMeta,
    stats,
    formFields,
    initialValues,
    setDraftValues,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    setCurrentPage,
    searchKeyword,
    sortBy,
    sortDirection,
    handleSearchChange,
    handleSortChange,
  } = useAdminRusunPage();

  if (!canManage) {
    return (
      <AdminAccessDenied description="Modul rusun hanya dapat dikelola oleh admin." />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Data Sebaran Rusun"
        description="Kelola data rusun, unit, dan lokasi bangunan."
        icon={<Building2 className="h-5 w-5" />}
        createLabel="Tambah Rusun"
        onCreate={openCreateDialog}
      />

      <AdminStatsGrid
        items={[
          { label: "Total Rusun", value: stats.totalRusun },
          {
            label: "Unit Halaman Ini",
            value: stats.pageUnits.toLocaleString("id-ID"),
          },
        ]}
        columnsClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      />

      {rusunQuery.error ? (
        <AdminErrorAlert message={`Gagal mengambil data: ${rusunQuery.error.message}`} />
      ) : null}

      <AdminDataTable<RusunData>
        columns={rusunColumns}
        data={rusunList}
        searchFields={["name", "kabupaten", "kecamatan", "address"]}
        searchPlaceholder="Cari rusun..."
        actions={[editAction(openEditDialog), deleteAction(handleDelete)]}
        isLoading={rusunQuery.isLoading}
        isRefreshing={rusunQuery.isFetching && !rusunQuery.isLoading}
        emptyMessage="Belum ada data rusun."
        pagination={{
          currentPage: rusunMeta?.page ?? 1,
          totalPages: rusunMeta?.totalPages ?? 1,
          totalItems: rusunMeta?.totalRecords ?? rusunList.length,
          pageSize: rusunMeta?.limit ?? 10,
          onPageChange: setCurrentPage,
          searchValue: searchKeyword,
          onSearchChange: handleSearchChange,
          searchMode: "local",
          sortKey: sortBy,
          sortDirection,
          onSortChange: handleSortChange,
          sortMode: "local",
        }}
      />

      <AdminFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={editingItem ? "Edit Data Rusun" : "Tambah Data Rusun"}
        description="Lengkapi identitas rusun, jumlah unit, lokasi, dan gambar bangunan."
        fields={formFields}
        initialValues={initialValues}
        onValuesChange={setDraftValues}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Simpan Perubahan" : "Tambah Rusun"}
        isLoading={isSaving}
        errors={formErrors}
      />
    </div>
  );
}
