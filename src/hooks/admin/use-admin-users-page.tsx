"use client";

import { useCallback, useMemo, useState } from "react";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminAuth, type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useConfirmDialog } from "@/components/providers/ConfirmDialogProvider";
import { useToast } from "@/hooks/use-toast";
import { getStringFormValue } from "@/lib/admin/form";
import { canManageUsers } from "@/lib/admin/roles";
import {
  AdminApiError,
  normalizeAdminFieldErrors,
} from "@/lib/admin-client";
import {
  ADMIN_QUERY_GC_TIME_MS,
  ADMIN_QUERY_STALE_TIME_MS,
  QUERY_KEY_PARTS,
  QUERY_KEYS,
} from "@/lib/constants";
import { sanitizeNip } from "@/lib/security";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminAuditEntries,
  fetchAdminUserDetail,
  fetchAdminUsersPage,
  updateAdminUser,
  type ControlUserCreatePayload,
  type ControlUserPayload,
} from "@/services/admin-users.service";
import type {
  AdminDirectoryUser,
  AdminPaginationMeta,
  UserRole,
} from "@/types/admin";

import { useAdminCreateIntent } from "./use-admin-create-intent";
import { useAdminListQuery } from "./use-admin-list-query";

type UserStatusFilter = "active" | "inactive";
type UserListFilters = {
  role?: UserRole;
  isActive?: UserStatusFilter;
};

function buildControlUsersPayload(
  values: AdminFormValues,
  options: { allowPassword: true }
): ControlUserCreatePayload;
function buildControlUsersPayload(
  values: AdminFormValues,
  options?: { allowPassword?: false }
): ControlUserPayload;
function buildControlUsersPayload(
  values: AdminFormValues,
  options?: { allowPassword?: boolean }
) {
  if (!options?.allowPassword) {
    return {
      name: getStringFormValue(values, "name"),
      phone: getStringFormValue(values, "phone"),
    } satisfies ControlUserPayload;
  }

  const role = getStringFormValue(values, "role") === "admin" ? "admin" : "user";

  const payload: ControlUserCreatePayload = {
    name: getStringFormValue(values, "name"),
    email: getStringFormValue(values, "email"),
    nip: sanitizeNip(getStringFormValue(values, "nip")).slice(0, 18),
    phone: getStringFormValue(values, "phone"),
    role,
    isActive: getStringFormValue(values, "isActive") !== "inactive",
    password: getStringFormValue(values, "password"),
  };

  return payload;
}

function createDefaultPaginationMeta(page: number): AdminPaginationMeta {
  return {
    totalRecords: 0,
    page,
    limit: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

export function useAdminUsersPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const confirm = useConfirmDialog();
  const queryClient = useQueryClient();
  const listQuery = useAdminListQuery<UserListFilters>();
  const { currentPage, setFilter, setPage } = listQuery;

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminDirectoryUser | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isHydratingUser, setIsHydratingUser] = useState(false);

  const canManage = canManageUsers(user.role);

  const openCreateDialog = useCallback(() => {
    setEditingUser(null);
    setFormErrors({});
    setFormOpen(true);
  }, []);

  useAdminCreateIntent({
    enabled: canManage,
    onCreate: openCreateDialog,
  });

  const usersQuery = useQuery({
    queryKey: [
      QUERY_KEYS.adminUsers,
      listQuery.queryParams,
    ],
    queryFn: () =>
      fetchAdminUsersPage({
        page: listQuery.queryParams.page,
        limit: listQuery.queryParams.perPage,
        keyword: listQuery.queryParams.keyword,
        sortBy: listQuery.queryParams.sortBy,
        sortDirection: listQuery.queryParams.sortDirection,
        role: listQuery.filters.role,
        isActive: listQuery.filters.isActive,
      }),
    staleTime: ADMIN_QUERY_STALE_TIME_MS,
    gcTime: ADMIN_QUERY_GC_TIME_MS,
    placeholderData: keepPreviousData,
    enabled: canManage,
  });

  const auditQuery = useQuery({
    queryKey: [QUERY_KEYS.adminAudit, QUERY_KEY_PARTS.users],
    queryFn: () => fetchAdminAuditEntries({ limit: 8 }),
    staleTime: ADMIN_QUERY_STALE_TIME_MS,
    gcTime: ADMIN_QUERY_GC_TIME_MS,
    enabled: canManage,
  });

  const usersMeta =
    usersQuery.data?.meta ?? createDefaultPaginationMeta(listQuery.currentPage);
  const pageUsers = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data]);
  const roleFilter = listQuery.filters.role ?? "all";
  const statusFilter = listQuery.filters.isActive ?? "all";
  const setRoleFilter = useCallback(
    (value: "all" | UserRole) => {
      setFilter("role", value === "all" ? undefined : value);
    },
    [setFilter]
  );
  const setStatusFilter = useCallback(
    (value: "all" | UserStatusFilter) => {
      setFilter("isActive", value === "all" ? undefined : value);
    },
    [setFilter]
  );
  const pagination = {
    ...listQuery.tableState,
    currentPage: usersMeta.page,
    totalPages: usersMeta.totalPages,
    totalItems: usersMeta.totalRecords,
    pageSize: usersMeta.limit || listQuery.tableState.pageSize,
  };

  const stats = useMemo(
    () => ({
      totalUsers: usersMeta.totalRecords,
    }),
    [usersMeta.totalRecords]
  );

  const formFields = useMemo<FormFieldDef[]>(
    () =>
      editingUser
        ? [
            {
              name: "name",
              label: "Nama Lengkap",
              type: "text",
              required: true,
              placeholder: "Contoh: Rina Sari",
            },
            {
              name: "phone",
              label: "Nomor Telepon",
              type: "text",
              placeholder: "Contoh: 081234567890",
            },
          ]
        : [
      {
        name: "name",
        label: "Nama Lengkap",
        type: "text",
        required: true,
        placeholder: "Contoh: Rina Sari",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "rina@bp3kp.go.id",
      },
      {
        name: "nip",
        label: "NIP",
        type: "text",
        required: true,
        placeholder: "18 digit NIP",
        helperText: "Masukkan NIP 18 digit sesuai data akun.",
      },
      {
        name: "phone",
        label: "Nomor Telepon",
        type: "text",
        placeholder: "Contoh: 081234567890",
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        options: [
          { value: "admin", label: "Admin" },
          { value: "user", label: "User" },
        ],
        defaultValue: "user",
      },
      {
        name: "isActive",
        label: "Status Akun",
        type: "select",
        required: true,
        options: [
          { value: "active", label: "Aktif" },
          { value: "inactive", label: "Nonaktif" },
        ],
        defaultValue: "active",
      },
      {
        name: "password",
        label: "Password",
        type: "password" as const,
        required: true,
        placeholder: "Minimal 8 karakter",
        helperText: "Isi password hanya saat membuat akun baru.",
      },
    ],
    [editingUser]
  );

  const initialValues: AdminFormValues = editingUser
    ? {
        name: editingUser.name,
        email: editingUser.email,
        nip: editingUser.nip ?? "",
        phone: editingUser.phone,
        role: editingUser.role,
        isActive: editingUser.isActive ? "active" : "inactive",
      }
    : {
        name: "",
        email: "",
        nip: "",
        phone: "",
        role: "user",
        isActive: "active",
        password: "",
      };

  const refreshUsers = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminUsers] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminAudit] }),
    ]);
  }, [queryClient]);

  const openEditDialog = useCallback(
    async (item: AdminDirectoryUser) => {
      setIsHydratingUser(true);
      setFormErrors({});

      try {
        const detail = await fetchAdminUserDetail(item.id);

        setEditingUser(detail);
        setFormOpen(true);
      } catch (error) {
        toast({
          title: "Gagal mengambil detail user",
          description:
            error instanceof Error
              ? error.message
              : "Detail user backend belum dapat dibuka.",
          variant: "destructive",
        });
      } finally {
        setIsHydratingUser(false);
      }
    },
    [toast]
  );

  const handleSubmit = useCallback(
    async (values: AdminFormValues) => {
      setIsSaving(true);
      setFormErrors({});

      try {
        if (editingUser) {
          const payload = buildControlUsersPayload(values);
          await updateAdminUser(editingUser.id, payload);
        } else {
          const payload = buildControlUsersPayload(values, {
            allowPassword: true,
          });
          await createAdminUser(payload);
        }

        await refreshUsers();
        setFormOpen(false);
        setEditingUser(null);
        toast({
          title: editingUser ? "User berhasil diperbarui" : "User berhasil dibuat",
          description: editingUser
            ? "Perubahan user backend sudah tersimpan."
            : "User baru sudah ditambahkan ke backend.",
        });
      } catch (error) {
        if (error instanceof AdminApiError) {
          setFormErrors(normalizeAdminFieldErrors(error.details));
        }

        toast({
          title: editingUser ? "Gagal memperbarui user" : "Gagal membuat user",
          description:
            error instanceof Error
              ? error.message
              : "Permintaan Control Users belum berhasil diproses.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [editingUser, refreshUsers, toast]
  );

  const handleDelete = useCallback(
    async (item: AdminDirectoryUser) => {
      const confirmed = await confirm({
        title: "Hapus user?",
        description: `User "${item.name}" akan dihapus dari backend.`,
        confirmLabel: "Hapus",
        destructive: true,
      });

      if (!confirmed) {
        return;
      }

      const shouldMoveToPreviousPage =
        currentPage > 1 && pageUsers.length === 1;

      try {
        await deleteAdminUser(item.id);

        if (shouldMoveToPreviousPage) {
          setPage(Math.max(1, currentPage - 1));
        }

        await refreshUsers();
        toast({
          title: "User berhasil dihapus",
          description: "Data user backend telah dihapus dari Control Users.",
        });
      } catch (error) {
        toast({
          title: "Gagal menghapus user",
          description:
            error instanceof Error
              ? error.message
              : "Backend menolak penghapusan user ini.",
          variant: "destructive",
        });
      }
    },
    [
      confirm,
      currentPage,
      pageUsers.length,
      refreshUsers,
      setPage,
      toast,
    ]
  );

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormOpen(open);

    if (!open) {
      setEditingUser(null);
      setFormErrors({});
    }
  }, []);

  return {
    canManage,
    currentUserId: user.id,
    searchKeyword: listQuery.searchInput,
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
    filteredUsers: pageUsers,
    pagination,
    stats,
    auditEntries: auditQuery.data ?? [],
    formFields,
    initialValues,
    openCreateDialog,
    refreshUsers,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    handleSearchChange: listQuery.setSearch,
    resetFilters: listQuery.resetFilters,
  };
}
