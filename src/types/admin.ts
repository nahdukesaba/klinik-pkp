export type UserRole = "admin" | "user";

export interface AdminDirectoryUser {
  id: string;
  name: string;
  email: string;
  nip?: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  isEditable?: boolean;
  canDelete?: boolean;
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
