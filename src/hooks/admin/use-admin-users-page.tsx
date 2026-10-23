"use client";

import { useCallback, useMemo, useState } from "react";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminAuth, type AdminFormValues, type FormFieldDef } from "@/components/admin";
import { useConfirmDialog } from "@/components/providers/ConfirmDialogProvider";
import { useToast } from "@/hooks/use-toast";
import { getStringFormValue } from "@/lib/admin/form";
import { canManageUsers } from "@/lib/admin/roles";
import { AdminApiError, normalizeAdminFieldErrors } from "@/lib/admin-client";
import { ADMIN_QUERY_GC_TIME_MS, ADMIN_QUERY_STALE_TIME_MS, QUERY_KEY_PARTS, QUERY_KEYS } from "@/lib/constants";
import { sanitizeNip } from "@/lib/security";
import { createAdminUser, deleteAdminUser, fetchAdminAuditEntries, fetchAdminUserDetail, fetchAdminUsersPage, updateAdminUser, type ControlUserCreatePayload, type ControlUserPayload } from "@/services/admin-users.service";
import type { AdminDirectoryUser, AdminPaginationMeta, MembershipStatus, UserRole } from "@/types/admin";

import { useAdminCreateIntent } from "./use-admin-create-intent";
import { useAdminListQuery } from "./use-admin-list-query";

type UserListFilters = { role?: UserRole; status?: MembershipStatus };
const statusValues = new Set<MembershipStatus>(["pending", "approved", "rejected", "disabled"]);

function buildControlUsersPayload(values: AdminFormValues, create: true): ControlUserCreatePayload;
function buildControlUsersPayload(values: AdminFormValues, create?: false): ControlUserPayload;
function buildControlUsersPayload(values: AdminFormValues, create = false) {
  const role: UserRole = getStringFormValue(values, "role") === "admin" ? "admin" : "user";
  const rawStatus = getStringFormValue(values, "status") as MembershipStatus;
  const base: ControlUserPayload = {
    fullName: getStringFormValue(values, "fullName"), phone: getStringFormValue(values, "phone"),
    nip: sanitizeNip(getStringFormValue(values, "nip")).slice(0, 18), nik: getStringFormValue(values, "nik"),
    alamat: getStringFormValue(values, "alamat"), gelarDepan: getStringFormValue(values, "gelarDepan"),
    gelarBelakang: getStringFormValue(values, "gelarBelakang"), role,
    status: statusValues.has(rawStatus) ? rawStatus : "pending",
  };
  return create ? { ...base, email: getStringFormValue(values, "email") } satisfies ControlUserCreatePayload : base;
}

function defaultMeta(page: number): AdminPaginationMeta { return { totalRecords: 0, page, limit: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }; }

const commonFields: FormFieldDef[] = [
  { name: "fullName", label: "Nama Lengkap", type: "text", required: true, placeholder: "Contoh: Rina Sari" },
  { name: "nip", label: "NIP", type: "text", placeholder: "18 digit NIP", helperText: "Opsional; jika diisi harus 18 digit." },
  { name: "nik", label: "NIK", type: "text", placeholder: "NIK pegawai" },
  { name: "phone", label: "Nomor Telepon", type: "text", placeholder: "Contoh: 081234567890" },
  { name: "alamat", label: "Alamat", type: "text" },
  { name: "gelarDepan", label: "Gelar Depan", type: "text" },
  { name: "gelarBelakang", label: "Gelar Belakang", type: "text" },
  { name: "role", label: "Role Klinik", type: "select", required: true, options: [{ value: "admin", label: "Admin" }, { value: "user", label: "User" }], defaultValue: "user" },
  { name: "status", label: "Status Akses Klinik", type: "select", required: true, options: [{ value: "pending", label: "Menunggu" }, { value: "approved", label: "Disetujui" }, { value: "rejected", label: "Ditolak" }, { value: "disabled", label: "Dinonaktifkan" }], defaultValue: "pending" },
];

export function useAdminUsersPage() {
  const { user } = useAdminAuth(); const { toast } = useToast(); const confirm = useConfirmDialog(); const queryClient = useQueryClient();
  const listQuery = useAdminListQuery<UserListFilters>(); const { currentPage, setFilter, setPage } = listQuery;
  const [formOpen, setFormOpen] = useState(false); const [editingUser, setEditingUser] = useState<AdminDirectoryUser | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({}); const [isSaving, setIsSaving] = useState(false); const [isHydratingUser, setIsHydratingUser] = useState(false);
  const canManage = canManageUsers(user.role);
  const openCreateDialog = useCallback(() => { setEditingUser(null); setFormErrors({}); setFormOpen(true); }, []);
  useAdminCreateIntent({ enabled: canManage, onCreate: openCreateDialog });

  const usersQuery = useQuery({
    queryKey: [QUERY_KEYS.adminUsers, listQuery.queryParams],
    queryFn: () => fetchAdminUsersPage({ page: listQuery.queryParams.page, limit: listQuery.queryParams.perPage, keyword: listQuery.queryParams.keyword, sortBy: listQuery.queryParams.sortBy, sortDirection: listQuery.queryParams.sortDirection, role: listQuery.filters.role, status: listQuery.filters.status }),
    staleTime: ADMIN_QUERY_STALE_TIME_MS, gcTime: ADMIN_QUERY_GC_TIME_MS, placeholderData: keepPreviousData, enabled: canManage,
  });
  const auditQuery = useQuery({ queryKey: [QUERY_KEYS.adminAudit, QUERY_KEY_PARTS.users], queryFn: () => fetchAdminAuditEntries({ limit: 8 }), staleTime: ADMIN_QUERY_STALE_TIME_MS, gcTime: ADMIN_QUERY_GC_TIME_MS, enabled: canManage });
  const usersMeta = usersQuery.data?.meta ?? defaultMeta(currentPage); const pageUsers = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data]);
  const roleFilter = listQuery.filters.role ?? "all"; const statusFilter = listQuery.filters.status ?? "all";
  const setRoleFilter = useCallback((value: "all" | UserRole) => setFilter("role", value === "all" ? undefined : value), [setFilter]);
  const setStatusFilter = useCallback((value: "all" | MembershipStatus) => setFilter("status", value === "all" ? undefined : value), [setFilter]);
  const pagination = { ...listQuery.tableState, currentPage: usersMeta.page, totalPages: usersMeta.totalPages, totalItems: usersMeta.totalRecords, pageSize: usersMeta.limit || listQuery.tableState.pageSize };
  const formFields = useMemo<FormFieldDef[]>(() => editingUser ? commonFields : [{ name: "email", label: "Email Login", type: "email", required: true, placeholder: "rina@bp3kp.go.id", helperText: "Supabase akan mengirim undangan penyiapan akun." }, ...commonFields], [editingUser]);
  const initialValues: AdminFormValues = editingUser ? { fullName: editingUser.fullName, email: editingUser.email, nip: editingUser.nip ?? "", nik: editingUser.nik ?? "", phone: editingUser.phone ?? "", alamat: editingUser.alamat ?? "", gelarDepan: editingUser.gelarDepan ?? "", gelarBelakang: editingUser.gelarBelakang ?? "", role: editingUser.role, status: editingUser.status } : { fullName: "", email: "", nip: "", nik: "", phone: "", alamat: "", gelarDepan: "", gelarBelakang: "", role: "user", status: "pending" };
  const refreshUsers = useCallback(async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminUsers] }), queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminAudit] })]); }, [queryClient]);
  const openEditDialog = useCallback(async (item: AdminDirectoryUser) => { setIsHydratingUser(true); setFormErrors({}); try { setEditingUser(await fetchAdminUserDetail(item.appUserId)); setFormOpen(true); } catch (error) { toast({ title: "Gagal mengambil detail user", description: error instanceof Error ? error.message : "Detail user tidak dapat dibuka.", variant: "destructive" }); } finally { setIsHydratingUser(false); } }, [toast]);
  const handleSubmit = useCallback(async (values: AdminFormValues) => { setIsSaving(true); setFormErrors({}); try { if (editingUser) await updateAdminUser(editingUser.appUserId, buildControlUsersPayload(values)); else await createAdminUser(buildControlUsersPayload(values, true)); await refreshUsers(); setFormOpen(false); setEditingUser(null); toast({ title: editingUser ? "Akses pengguna diperbarui" : "Undangan pengguna dibuat", description: editingUser ? "Profil dan membership Klinik telah diperbarui." : "Identitas canonical dan akses Klinik telah diproses oleh Central SSO." }); } catch (error) { if (error instanceof AdminApiError) setFormErrors(normalizeAdminFieldErrors(error.details)); toast({ title: editingUser ? "Gagal memperbarui user" : "Gagal membuat user", description: error instanceof Error ? error.message : "Permintaan Control Users gagal.", variant: "destructive" }); } finally { setIsSaving(false); } }, [editingUser, refreshUsers, toast]);
  const handleDelete = useCallback(async (item: AdminDirectoryUser) => { const confirmed = await confirm({ title: "Nonaktifkan akses Klinik?", description: `Akses Klinik untuk "${item.fullName}" akan dinonaktifkan. Akun Central dan akses aplikasi lain tetap ada.`, confirmLabel: "Nonaktifkan akses", destructive: true }); if (!confirmed) return; const previous = currentPage > 1 && pageUsers.length === 1; try { await deleteAdminUser(item.appUserId); if (previous) setPage(Math.max(1, currentPage - 1)); await refreshUsers(); toast({ title: "Akses Klinik dinonaktifkan", description: "Membership Klinik pengguna berstatus disabled." }); } catch (error) { toast({ title: "Gagal menonaktifkan akses", description: error instanceof Error ? error.message : "Backend menolak perubahan akses.", variant: "destructive" }); } }, [confirm, currentPage, pageUsers.length, refreshUsers, setPage, toast]);
  const handleFormOpenChange = useCallback((open: boolean) => { setFormOpen(open); if (!open) { setEditingUser(null); setFormErrors({}); } }, []);
  return { canManage, currentAppUserId: user.appUserId, searchKeyword: listQuery.searchInput, roleFilter, setRoleFilter, statusFilter, setStatusFilter, formOpen, editingUser, formErrors, isSaving, isHydratingUser, usersQuery, usersMeta, filteredUsers: pageUsers, pagination, stats: { totalUsers: usersMeta.totalRecords }, auditEntries: auditQuery.data ?? [], formFields, initialValues, openCreateDialog, refreshUsers, openEditDialog, handleSubmit, handleDelete, handleFormOpenChange, handleSearchChange: listQuery.setSearch, resetFilters: listQuery.resetFilters };
}
