"use client";

import { HandCoins } from "lucide-react";

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
import { useAdminBspsPage } from "@/hooks/admin/use-admin-bsps-page";
import type { BspsData } from "@/services/bsps.service";

const bspsColumns: Column<BspsData>[] = [
  {
    key: "nama",
    label: "Desa/Kelurahan",
    sortable: true,
    render: (item) => (
      <div>
        <p className="font-medium text-foreground">{item.kelurahan || item.nama}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.kecamatan && `Kec. ${item.kecamatan}`}
        </p>
      </div>
    ),
  },
  {
    key: "kabupaten",
    label: "Kabupaten/Kota",
    sortable: true,
  },
  {
    key: "alokasiUnit",
    label: "Alokasi Unit",
    sortable: true,
    render: (item) => (
      <span className="font-semibold text-foreground">
        {item.alokasiUnit.toLocaleString("id-ID")} unit
      </span>
    ),
    className: "text-right",
  },
  {
    key: "yearGiven",
    label: "Tahun",
    sortable: true,
    className: "text-center",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: "coordinates",
    label: "Koordinat",
    render: (item) => (
      <span className="font-mono text-xs text-muted-foreground">
        {item.coordinates[0].toFixed(4)}, {item.coordinates[1].toFixed(4)}
      </span>
    ),
  },
];

export default function AdminBspsPage() {
  const {
    canManage,
    formOpen,
    editingItem,
    formErrors,
    isSaving,
    bspsQuery,
    bspsList,
    bspsMeta,
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
  } = useAdminBspsPage();

  if (!canManage) {
    return (
      <AdminAccessDenied description="Modul BSPS hanya dapat dikelola oleh admin. Anda tetap bisa melihat ringkasan data di modul lain sesuai hak akses yang diberikan." />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Data Penerimaan BSPS"
        description="Kelola data bantuan perumahan secara aman langsung dari panel admin."
        icon={<HandCoins className="h-5 w-5" />}
        createLabel="Tambah BSPS"
        onCreate={openCreateDialog}
      />

      <AdminStatsGrid
        items={[
          { label: "Total Lokasi", value: stats.totalLokasi },
          {
            label: "Total Unit",
            value: stats.totalUnit.toLocaleString("id-ID"),
          },
          { label: "Selesai", value: stats.selesai },
          { label: "Dalam Proses", value: stats.proses },
        ]}
        columnsClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      />

      {bspsQuery.error ? (
        <AdminErrorAlert message={`Gagal memuat data: ${bspsQuery.error.message}`} />
      ) : null}

      <AdminDataTable<BspsData>
        columns={bspsColumns}
        data={bspsList}
        searchFields={["nama", "kelurahan", "kecamatan", "kabupaten"]}
        searchPlaceholder="Cari lokasi BSPS..."
        actions={[editAction(openEditDialog), deleteAction(handleDelete)]}
        isLoading={bspsQuery.isLoading}
        emptyMessage="Belum ada data BSPS."
        pagination={{
          currentPage: bspsMeta?.page ?? 1,
          totalPages: bspsMeta?.totalPages ?? 1,
          totalItems: bspsMeta?.totalRecords ?? bspsList.length,
          pageSize: bspsMeta?.limit ?? 10,
          onPageChange: setCurrentPage,
        }}
      />

      <AdminFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={editingItem ? "Edit Data BSPS" : "Tambah Data BSPS"}
        description="Lengkapi lokasi, unit bantuan, status, dan koordinat untuk data BSPS."
        fields={formFields}
        initialValues={initialValues}
        onValuesChange={setDraftValues}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Simpan Perubahan" : "Tambah BSPS"}
        isLoading={isSaving}
        errors={formErrors}
      />
    </div>
  );
}
