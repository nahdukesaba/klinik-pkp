export type UserRole = "admin" | "user";
export type MembershipStatus = "pending" | "approved" | "rejected" | "disabled";

import type { AdminDirectoryIdentity } from "@/lib/admin/user-contract";

export interface AdminDirectoryUser extends AdminDirectoryIdentity {
  authUserId?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  nip?: string | null;
  nik?: string | null;
  alamat?: string | null;
  gelarDepan?: string | null;
  gelarBelakang?: string | null;
  role: UserRole;
  status: MembershipStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPaginationMeta {
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminPaginatedUsers {
  items: AdminDirectoryUser[];
  meta: AdminPaginationMeta;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface RecentActivity {
  id: string;
  action: "create" | "update" | "delete" | "login";
  module: string;
  description: string;
  user: string;
  timestamp: string;
}

export interface DashboardStats {
  totalUsers: number;
  usersLoaded: number;
  adminUsersLoaded: number;
  activeUsersLoaded: number;
  inactiveUsersLoaded: number;
  totalRecordedActivities: number;
}
