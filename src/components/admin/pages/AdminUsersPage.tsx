"use client";

import { RefreshCw, Users } from "lucide-react";

import {
  AdminAccessDenied,
  AdminDataTable,
  AdminErrorAlert,
  AdminFormDialog,
  AdminPageHeader,
  AdminStatsGrid,
  AdminTableFilters,
  RoleBadge,
  StatusBadge,
  deleteAction,
  editAction,
  type Column,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAdminUsersPage } from "@/hooks/admin/use-admin-users-page";
import { formatDateId } from "@/lib/date";
import type { AdminDirectoryUser, AuditEntry } from "@/types/admin";

function formatTimestamp(value?: string) {
  if (!value) {
    return "-";
  }

  return formatDateId(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const userColumns: Column<AdminDirectoryUser>[] = [
  {
    key: "fullName",
    label: "Pengguna",
    sortable: true,
    sortField: "full_name",
    render: (item) => (
      <div className="max-w-[260px]">
        <p className="font-medium text-foreground break-words">{item.fullName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground break-all">
          {item.email}
        </p>
      </div>
    ),
  },
  {
    key: "nip",
    label: "NIP / Telepon",
    render: (item) => (
      <div className="space-y-1">
        <p className="font-mono text-xs text-foreground">{item.nip || "-"}</p>
        <p className="text-xs text-muted-foreground">{item.phone || "-"}</p>
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    sortField: "role",
    render: (item) => <RoleBadge role={item.role} />,
    className: "text-center",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    sortField: "status",
    render: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: "updatedAt",
    label: "Diperbarui",
    sortable: true,
    sortField: "updated_at",
    render: (item) => (
      <span className="text-xs text-muted-foreground">
        {formatTimestamp(item.updatedAt ?? item.createdAt)}
      </span>
    ),
  },
];

function AuditEntryList({ entries }: { entries: AuditEntry[] }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Aktivitas Terbaru
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan audit untuk perubahan akun pengguna.
          </p>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-border/70 bg-background/70 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {entry.details}
                  </p>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {entry.userName} | {entry.module} | {entry.action}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Belum ada aktivitas audit untuk modul pengguna.
        </div>
      )}
    </section>
  );
}

export default function AdminUsersPage() {
  const {
    canManage,
    currentAppUserId,
    searchKeyword,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    pagination,
    formOpen,
    editingUser,
    formErrors,
    isSaving,
    usersQuery,
    filteredUsers,
    stats,
    auditEntries,
    formFields,
    initialValues,
    openCreateDialog,
    refreshUsers,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    handleSearchChange,
    resetFilters,
  } = useAdminUsersPage();

  if (!canManage) {
    return (
      <AdminAccessDenied description="Modul Control Users hanya dapat dikelola oleh admin." />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Control Users"
        description="Kelola akun admin dan user yang dapat mengakses sistem internal."
        icon={<Users className="h-5 w-5" />}
        createLabel="Tambah User"
        onCreate={openCreateDialog}
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshUsers()}
            disabled={usersQuery.isFetching}
          >
            <RefreshCw
              className={usersQuery.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Muat Ulang
          </Button>
        }
      />

      <AdminStatsGrid
        items={[
          { label: "Total User", value: stats.totalUsers, icon: <Users className="h-5 w-5" /> },
        ]}
        columnsClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      />

      <AdminTableFilters
        searchValue={searchKeyword}
        searchPlaceholder="Cari user..."
        onSearchChange={handleSearchChange}
        onReset={resetFilters}
        selects={[
          {
            key: "role",
            label: "Role",
            value: roleFilter,
            options: [
              { value: "all", label: "Semua Role" },
              { value: "admin", label: "Admin" },
              { value: "user", label: "User" },
            ],
            onChange: (value) =>
              setRoleFilter(value === "admin" || value === "user" ? value : "all"),
          },
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            options: [
              { value: "all", label: "Semua Status" },
              { value: "pending", label: "Menunggu" },
              { value: "approved", label: "Disetujui" },
              { value: "rejected", label: "Ditolak" },
              { value: "disabled", label: "Dinonaktifkan" },
            ],
            onChange: (value) =>
              setStatusFilter(
                value === "pending" || value === "approved" || value === "rejected" || value === "disabled" ? value : "all"
              ),
          },
        ]}
      />

      {usersQuery.error ? (
        <AdminErrorAlert message={`Gagal mengambil data: ${usersQuery.error.message}`} />
      ) : null}

      <AdminDataTable<AdminDirectoryUser>
        columns={userColumns}
        data={filteredUsers}
        keyField="appUserId"
        actions={[
          editAction(openEditDialog, {
            isVisible: () => true,
          }),
          deleteAction(handleDelete, {
            label: "Nonaktifkan akses Klinik",
            isVisible: (item) => item.appUserId !== currentAppUserId && item.status !== "disabled",
          }),
        ]}
        isLoading={usersQuery.isLoading}
        emptyMessage="Belum ada data pengguna."
        pagination={pagination}
      />

      <AuditEntryList entries={auditEntries} />

      <AdminFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={editingUser ? "Edit User" : "Tambah User"}
        description={
          editingUser
            ? "Perbarui profil pegawai, role, dan status membership Klinik. Email login tetap read-only."
            : "Buat atau gunakan kembali identitas Central, lalu tetapkan akses Klinik. Supabase menangani undangan dan password."
        }
        fields={formFields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={editingUser ? "Simpan Perubahan" : "Tambah User"}
        isLoading={isSaving}
        errors={formErrors}
      />
    </div>
  );
}
