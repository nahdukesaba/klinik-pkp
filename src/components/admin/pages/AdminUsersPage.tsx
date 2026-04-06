"use client";

import { BadgeCheck, RefreshCw, Shield, UserX, Users } from "lucide-react";

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
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAdminUsersPage } from "@/hooks/admin/use-admin-users-page";
import { formatDateId } from "@/lib/date";
import type { AdminDirectoryUser, UserRole } from "@/types/admin";
import type { Column } from "@/components/admin";

const controlUsersColumns: Column<AdminDirectoryUser>[] = [
  {
    key: "name",
    label: "User",
    sortable: true,
    render: (item) => (
      <div className="w-full max-w-[16rem] sm:max-w-none">
        <p className="font-medium text-foreground break-words">{item.name}</p>
        <p className="mt-1 text-xs text-muted-foreground break-all">{item.email}</p>
        <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground/80">
          {item.nip || "NIP detail tersedia saat edit"}
        </p>
      </div>
    ),
  },
  {
    key: "phone",
    label: "Telepon",
    render: (item) => (
      <span className="font-mono text-xs text-muted-foreground">
        {item.phone || "-"}
      </span>
    ),
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    render: (item) => <RoleBadge role={item.role} />,
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
    label: "Update",
    sortable: true,
    render: (item) => (
      <span className="text-xs text-muted-foreground">
        {item.updatedAt
          ? formatDateId(item.updatedAt, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-"}
      </span>
    ),
  },
];

const roleOptions = [
  { value: "all", label: "Semua Role" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
] as const;

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
] as const;

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
      <AdminAccessDenied description="Modul Control Users hanya dapat diakses oleh role admin." />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Control Users"
        description="Kelola akun per halaman."
        icon={<Users className="h-5 w-5" />}
        createLabel="Tambah User"
        onCreate={openCreateDialog}
        actions={
          <Button variant="outline" onClick={() => void refreshUsers()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <AdminStatsGrid
        items={[
          {
            label: "Total Users",
            value: stats.totalUsers.toLocaleString("id-ID"),
            icon: <Users className="h-4 w-4" />,
            tone: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
          },
          {
            label: "User di Halaman Ini",
            value: stats.pageUsers.toLocaleString("id-ID"),
            icon: <BadgeCheck className="h-4 w-4" />,
            tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          },
          {
            label: "Admin di Halaman Ini",
            value: stats.adminsOnPage.toLocaleString("id-ID"),
            icon: <Shield className="h-4 w-4" />,
            tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
          },
          {
            label: "Nonaktif di Halaman Ini",
            value: (stats.pageUsers - stats.activeOnPage).toLocaleString("id-ID"),
            icon: <UserX className="h-4 w-4" />,
            tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
          },
        ]}
      />

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Filter</h2>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={roleFilter === option.value ? "default" : "outline"}
                  onClick={() => setRoleFilter(option.value as "all" | UserRole)}
                  className="h-9 rounded-full px-4"
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={statusFilter === option.value ? "default" : "outline"}
                  onClick={() =>
                    setStatusFilter(option.value as "all" | "active" | "inactive")
                  }
                  className="h-9 rounded-full px-4"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {usersQuery.isError ? (
        <AdminErrorAlert
          message={`Gagal memuat data Control Users: ${usersQuery.error.message}`}
        />
      ) : null}

      <AdminDataTable<AdminDirectoryUser>
        columns={controlUsersColumns}
        data={filteredUsers}
        searchFields={["name", "email", "phone", "role", "nip"]}
        searchPlaceholder="Cari nama, email, NIP, atau telepon pada halaman ini..."
        actions={[editAction(openEditDialog), deleteAction(handleDelete)]}
        isLoading={usersQuery.isLoading || isHydratingUser}
        emptyMessage="Belum ada data user pada halaman atau filter ini."
        headerActions={
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            Halaman {usersMeta.page} dari {usersMeta.totalPages}
          </span>
        }
        pagination={{
          currentPage: usersMeta.page,
          totalPages: usersMeta.totalPages,
          totalItems: usersMeta.totalRecords,
          pageSize: usersMeta.limit,
          onPageChange: handlePageChange,
        }}
      />

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Aktivitas Admin Terbaru
        </h2>

        {auditEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            Belum ada aktivitas admin yang tercatat pada sesi server saat ini.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {auditEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-border/70 bg-background/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {entry.details}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {entry.action} | {entry.module}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateId(entry.timestamp, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground break-words">
                  Oleh {entry.userName} • IP {entry.ipAddress}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <AdminFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={editingUser ? "Edit Control User" : "Tambah Control User"}
        description="Perubahan akun dikirim langsung ke backend utama."
        fields={formFields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={editingUser ? "Simpan Perubahan" : "Buat User"}
        isLoading={isSaving || isHydratingUser}
        errors={formErrors}
      />
    </div>
  );
}
