"use client";

import { RefreshCw, Users } from "lucide-react";

import {
  AdminAccessDenied,
  AdminDataTable,
  AdminErrorAlert,
  AdminFormDialog,
  AdminPageHeader,
  AdminStatsGrid,
  RoleBadge,
  StatusBadge,
  deleteAction,
  editAction,
  type Column,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAdminUsersPage } from "@/hooks/admin/use-admin-users-page";
import { formatDateId } from "@/lib/date";
import type { AdminDirectoryUser, AuditEntry, UserRole } from "@/types/admin";

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
    key: "name",
    label: "Pengguna",
    sortable: true,
    render: (item) => (
      <div className="max-w-[260px]">
        <p className="font-medium text-foreground break-words">{item.name}</p>
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
    render: (item) => <RoleBadge role={item.role} />,
    className: "text-center",
  },
  {
    key: "isActive",
    label: "Status",
    sortable: true,
    render: (item) => (
      <StatusBadge status={item.isActive ? "active" : "inactive"} />
    ),
  },
  {
    key: "updatedAt",
    label: "Diperbarui",
    sortable: true,
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

function FilterBar({
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}: {
  roleFilter: "all" | UserRole;
  setRoleFilter: (value: "all" | UserRole) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (value: "all" | "active" | "inactive") => void;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Filter Role
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={roleFilter === "all" ? "default" : "outline"}
              onClick={() => setRoleFilter("all")}
            >
              Semua
            </Button>
            <Button
              type="button"
              variant={roleFilter === "admin" ? "default" : "outline"}
              onClick={() => setRoleFilter("admin")}
            >
              Admin
            </Button>
            <Button
              type="button"
              variant={roleFilter === "user" ? "default" : "outline"}
              onClick={() => setRoleFilter("user")}
            >
              User
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Filter Status
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              Semua
            </Button>
            <Button
              type="button"
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
            >
              Aktif
            </Button>
            <Button
              type="button"
              variant={statusFilter === "inactive" ? "default" : "outline"}
              onClick={() => setStatusFilter("inactive")}
            >
              Nonaktif
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AdminUsersPage() {
  const {
    canManage,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    formOpen,
    editingUser,
    formErrors,
    isSaving,
    isHydratingUser,
    usersQuery,
    usersMeta,
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
    handlePageChange,
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

      <FilterBar
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {usersQuery.error ? (
        <AdminErrorAlert message={`Gagal memuat data: ${usersQuery.error.message}`} />
      ) : null}

      {isHydratingUser ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          Memuat detail user...
        </div>
      ) : null}

      <AdminDataTable<AdminDirectoryUser>
        columns={userColumns}
        data={filteredUsers}
        searchFields={["name", "email", "nip", "phone"]}
        searchPlaceholder="Cari user..."
        actions={[editAction(openEditDialog), deleteAction(handleDelete)]}
        isLoading={usersQuery.isLoading}
        emptyMessage="Belum ada data pengguna."
        pagination={{
          currentPage: usersMeta.page,
          totalPages: usersMeta.totalPages,
          totalItems: usersMeta.totalRecords,
          pageSize: usersMeta.limit,
          onPageChange: handlePageChange,
        }}
      />

      <AuditEntryList entries={auditEntries} />

      <AdminFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={editingUser ? "Edit User" : "Tambah User"}
        description={
          editingUser
            ? "Perbarui identitas, role, dan status akun pengguna. Password tidak dapat diubah dari halaman ini."
            : "Lengkapi identitas, role, status akun, dan password pengguna."
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
