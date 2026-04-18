"use client";

import { startTransition, useCallback, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminAuth, type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useToast } from "@/hooks/use-toast";
import { getStringFormValue } from "@/lib/admin/form";
import { canManageUsers } from "@/lib/admin/roles";
import {
  AdminApiError,
  adminFetch,
  normalizeAdminFieldErrors,
} from "@/lib/admin-client";
import { QUERY_CONFIG } from "@/lib/constants";
import { sanitizeNip } from "@/lib/security";
import type {
  AdminDirectoryUser,
  AdminPaginationMeta,
  AuditEntry,
  UserRole,
} from "@/types/admin";

import { useAdminCreateIntent } from "./use-admin-create-intent";

const USERS_PAGE_LIMIT = 10;

function buildControlUsersPayload(
  values: AdminFormValues,
  options?: { allowPassword?: boolean }
) {
  const role = getStringFormValue(values, "role") === "admin" ? "admin" : "user";

  const payload = {
    name: getStringFormValue(values, "name"),
    email: getStringFormValue(values, "email"),
    nip: sanitizeNip(getStringFormValue(values, "nip")).slice(0, 18),
    phone: getStringFormValue(values, "phone"),
    role,
    isActive: getStringFormValue(values, "isActive") !== "inactive",
  } satisfies {
    name: string;
    email: string;
    nip: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
  };

  if (!options?.allowPassword) {
    return payload;
  }

  return {
    ...payload,
    password: getStringFormValue(values, "password"),
  };
}

function createDefaultPaginationMeta(page: number): AdminPaginationMeta {
  return {
    totalRecords: 0,
    page,
    limit: USERS_PAGE_LIMIT,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

export function useAdminUsersPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
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
    queryKey: ["admin-users", currentPage],
    queryFn: () =>
      adminFetch<{ data: AdminDirectoryUser[]; meta: AdminPaginationMeta }>(
        `/api/admin/users?page=${currentPage}&limit=${USERS_PAGE_LIMIT}`
      ),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
    placeholderData: (previousData) => previousData,
    enabled: canManage,
  });

  const auditQuery = useQuery({
    queryKey: ["admin-audit", "users"],
    queryFn: async () =>
      (await adminFetch<{ data: AuditEntry[] }>("/api/admin/audit?limit=8")).data,
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
    enabled: canManage,
  });

  const usersMeta = usersQuery.data?.meta ?? createDefaultPaginationMeta(currentPage);
  const pageUsers = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data]);

  const filteredUsers = useMemo(() => {
    return pageUsers.filter((item) => {
      const matchesRole = roleFilter === "all" || item.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? item.isActive : !item.isActive);

      return matchesRole && matchesStatus;
    });
  }, [pageUsers, roleFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      totalUsers: usersMeta.totalRecords,
      pageUsers: pageUsers.length,
      activeOnPage: pageUsers.filter((item) => item.isActive).length,
      adminsOnPage: pageUsers.filter((item) => item.role === "admin").length,
    }),
    [pageUsers, usersMeta.totalRecords]
  );

  const formFields = useMemo<FormFieldDef[]>(
    () => [
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
        helperText: "Gunakan NIP 18 digit yang sudah terdaftar di backend.",
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
      ...(!editingUser
        ? [
            {
              name: "password",
              label: "Password",
              type: "password" as const,
              required: true,
              placeholder: "Minimal 8 karakter",
              helperText: "Password hanya diisi saat membuat user baru.",
            },
          ]
        : []),
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
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] }),
    ]);
  }, [queryClient]);

  const openEditDialog = useCallback(
    async (item: AdminDirectoryUser) => {
      setIsHydratingUser(true);
      setFormErrors({});

      try {
        const detail = await adminFetch<{ data: AdminDirectoryUser }>(
          `/api/admin/users/${item.id}`
        );

        setEditingUser(detail.data);
        setFormOpen(true);
      } catch (error) {
        toast({
          title: "Gagal memuat detail user",
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
        const payload = buildControlUsersPayload(values, {
          allowPassword: !editingUser,
        });

        if (editingUser) {
          await adminFetch(`/api/admin/users/${editingUser.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        } else {
          await adminFetch("/api/admin/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
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
      if (!window.confirm(`Hapus user "${item.name}" dari backend?`)) {
        return;
      }

      const shouldMoveToPreviousPage = currentPage > 1 && pageUsers.length === 1;

      try {
        await adminFetch(`/api/admin/users/${item.id}`, {
          method: "DELETE",
        });

        if (shouldMoveToPreviousPage) {
          startTransition(() => {
            setCurrentPage((prev) => Math.max(1, prev - 1));
          });
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
    [currentPage, pageUsers.length, refreshUsers, toast]
  );

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormOpen(open);

    if (!open) {
      setEditingUser(null);
      setFormErrors({});
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      setCurrentPage(page);
    });
  }, []);

  return {
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
    auditEntries: auditQuery.data ?? [],
    formFields,
    initialValues,
    openCreateDialog,
    refreshUsers,
    openEditDialog,
    handleSubmit,
    handleDelete,
    handleFormOpenChange,
    handlePageChange,
  };
}
