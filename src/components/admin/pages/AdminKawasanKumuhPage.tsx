"use client";

import { Map } from "lucide-react";

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
import { useAdminKawasanKumuhPage } from "@/hooks/admin/use-admin-kawasan-kumuh-page";
import { cn } from "@/lib/utils";
import type { KawasanKumuhData } from "@/services/kawasan-kumuh.service";

function KumuhStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    berat: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    sedang: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ringan: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  };
  const dots: Record<string, string> = {
    berat: "bg-rose-500",
    sedang: "bg-amber-500",
    ringan: "bg-emerald-500",
  };
  const labels: Record<string, string> = {
    berat: "Kumuh Berat",
    sedang: "Kumuh Sedang",
    ringan: "Kumuh Ringan",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variants[status] || "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          dots[status] || "bg-gray-400"
        )}
      />
      {labels[status] || status}
    </span>
  );
}

const kumuhColumns: Column<KawasanKumuhData>[] = [
  {
    key: "name",
    label: "Nama Kawasan",
    sortable: true,
    sortField: "area_name",
    render: (item) => (
      <div className="max-w-[240px]">
        <p className="font-medium text-foreground break-words">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground break-words">
          {item.kelurahan}, {item.kecamatan}
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
    key: "luas",
    label: "Luas (Ha)",
    sortable: true,
    sortField: "total_area",
    render: (item) => (
      <span className="font-semibold text-foreground">
        {item.luas.toLocaleString("id-ID")} Ha
      </span>
    ),
    className: "text-right",
  },
  {
    key: "penduduk",
    label: "Penduduk",
    sortable: true,
    sortField: "total_population",
    render: (item) => item.penduduk.toLocaleString("id-ID"),
    className: "text-right",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    sortField: "slum_value",
    render: (item) => <KumuhStatusBadge status={item.status} />,
  },
  {
    key: "yearInspected",
    label: "Tahun",
    sortable: true,
    sortField: "year_inspected",
    className: "text-center",
  },
];

export default function AdminKawasanKumuhPage() {
  const {
    canManage,
    formOpen,
    editingItem,
    formErrors,
    isSaving,
    kumuhQuery,
    kumuhList,
    pagination,
    stats,
    formFields,
    initialValues,
    setDraftValues,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    searchKeyword,
    handleSearchChange,
    resetFilters,
  } = useAdminKawasanKumuhPage();

  if (!canManage) {
    return (
      <AdminAccessDenied description="Modul kawasan kumuh hanya dapat dikelola oleh admin." />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Data Kawasan Kumuh"
        description="Kelola data kawasan, indikator kekumuhan, dan lokasi hasil inspeksi."
        icon={<Map className="h-5 w-5" />}
        createLabel="Tambah Kawasan"
        onCreate={openCreateDialog}
      />

      <AdminStatsGrid
        items={[
          { label: "Total Kawasan", value: stats.totalKawasan },
          {
            label: "Luas Halaman Ini",
            value: `${stats.pageLuas.toLocaleString("id-ID")} Ha`,
          },
          {
            label: "Penduduk Halaman Ini",
            value: stats.pagePenduduk.toLocaleString("id-ID"),
          },
          { label: "Sedang Halaman Ini", value: stats.pageSedang },
          { label: "Ringan Halaman Ini", value: stats.pageRingan },
        ]}
        columnsClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      />

      {kumuhQuery.error ? (
        <AdminErrorAlert message={`Gagal mengambil data: ${kumuhQuery.error.message}`} />
      ) : null}

      <AdminTableFilters
        searchValue={searchKeyword}
        searchPlaceholder="Cari kawasan..."
        onSearchChange={handleSearchChange}
        onReset={resetFilters}
      />

      <AdminDataTable<KawasanKumuhData>
        columns={kumuhColumns}
        data={kumuhList}
        actions={[editAction(openEditDialog), deleteAction(handleDelete)]}
        isLoading={kumuhQuery.isLoading}
        emptyMessage="Belum ada data kawasan kumuh."
        pagination={pagination}
      />

      <AdminFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={editingItem ? "Edit Kawasan Kumuh" : "Tambah Kawasan Kumuh"}
        description="Lengkapi wilayah, luas kawasan, penduduk, nilai kekumuhan, dan koordinat inspeksi."
        fields={formFields}
        initialValues={initialValues}
        onValuesChange={setDraftValues}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Simpan Perubahan" : "Tambah Kawasan"}
        isLoading={isSaving}
        errors={formErrors}
      />
    </div>
  );
}
