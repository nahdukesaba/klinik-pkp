/**
 * Admin Dashboard â€” Type Definitions
 *
 * Semua tipe yang digunakan oleh komponen dan halaman admin.
 */

// --- Session / Access ---

export type UserRole = "admin" | "user";

// --- User Directory ---

export interface AdminDirectoryUser {
  id: string;
  name: string;
  email: string;
  nip?: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
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

// --- Dashboard Overview ---

export interface DashboardStats {
  totalUsers: number;
  usersLoaded: number;
  adminUsersLoaded: number;
  totalRecordedActivities: number;
}

export interface RecentActivity {
  id: string;
  action: "create" | "update" | "delete" | "login";
  module: string;
  description: string;
  user: string;
  timestamp: string;
}

// --- Audit Trail ---

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
