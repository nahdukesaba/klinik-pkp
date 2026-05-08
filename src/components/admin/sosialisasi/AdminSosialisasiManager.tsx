"use client";

import { PlusCircle } from "lucide-react";

import {
  AdminDataTable,
  AdminFormDialog,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAdminSosialisasiPage } from "@/hooks/admin/use-admin-sosialisasi-page";

import { type SosialisasiAdminView } from "./config";

export function AdminSosialisasiManager({
  view,
}: {
  view: SosialisasiAdminView;
}) {
  const {
    canManage,
    formOpen,
    editingItem,
    formErrors,
    isSaving,
    currentPage,
    sosialisasiQuery,
    viewConfig,
    sosialisasiMeta,
    formFields,
    initialValues,
    actions,
    openCreateDialog,
    handlePageChange,
    handleSubmit,
    handleFormOpenChange,
    setDraftValues,
  } = useAdminSosialisasiPage(view);

  if (!canManage) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">
          Akses dibatasi
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Modul sosialisasi hanya dapat dikelola oleh admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-foreground">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {viewConfig.icon}
            </span>
            {viewConfig.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {view !== "berita" ? (
            <Button
              type="button"
              onClick={openCreateDialog}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {viewConfig.addLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {sosialisasiQuery.error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Gagal memuat data: {sosialisasiQuery.error.message}
        </div>
      )}

      <AdminDataTable
        columns={viewConfig.columns}
        data={viewConfig.data}
        searchFields={viewConfig.searchFields}
        searchPlaceholder={viewConfig.searchPlaceholder}
        actions={actions}
        isLoading={sosialisasiQuery.isLoading}
        emptyMessage={viewConfig.emptyMessage}
        pagination={{
          currentPage: sosialisasiMeta?.page ?? currentPage,
          totalPages: sosialisasiMeta?.totalPages ?? 1,
          totalItems: sosialisasiMeta?.totalRecords ?? viewConfig.data.length,
          pageSize: sosialisasiMeta?.limit ?? 10,
          onPageChange: handlePageChange,
        }}
      />

      <AdminFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={
          view === "berita"
            ? "Upload Gambar Berita"
            : editingItem
              ? `Edit ${viewConfig.dialogTitle}`
              : `Tambah ${viewConfig.dialogTitle}`
        }
        description={
          view === "berita"
            ? "File lama tetap dipakai. Gambar maksimal 2 MB per file, total maksimal 4 MB."
            : "Lengkapi data kegiatan inti dan tambahkan dokumentasi bila diperlukan."
        }
        fields={formFields}
        initialValues={initialValues}
        onValuesChange={setDraftValues}
        onSubmit={handleSubmit}
        submitLabel={
          view === "berita"
            ? "Unggah Gambar"
            : editingItem
              ? "Simpan Perubahan"
              : viewConfig.addLabel
        }
        isLoading={isSaving}
        errors={formErrors}
      />
    </div>
  );
}
