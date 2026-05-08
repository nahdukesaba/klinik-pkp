/**
 * Admin Components — Central Export
 *
 * Semua komponen admin di-export dari sini untuk import yang bersih.
 */

export { AdminShell } from "./AdminShell";
export { AdminSidebar } from "./AdminSidebar";
export { AdminTopbar } from "./AdminTopbar";
export { AdminAuthProvider, useAdminAuth } from "./AdminAuthGuard";
export { AdminAccessDenied } from "./AdminAccessDenied";
export { AdminErrorAlert } from "./AdminErrorAlert";
export { AdminPageHeader } from "./AdminPageHeader";
export { AdminStatsGrid } from "./AdminStatsGrid";
export {
  AdminDataTable,
  StatusBadge,
  RoleBadge,
  editAction,
  deleteAction,
} from "./AdminDataTable";
export type { Column, TableAction } from "./AdminDataTable";
export { AdminFormDialog } from "./AdminFormDialog";
export type {
  AdminFormValue,
  AdminFormValues,
  ExistingUploadFile,
  FormFieldDef,
} from "./AdminFormDialog";
