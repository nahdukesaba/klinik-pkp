import "server-only";

import type { AuditEntry } from "@/types/admin";

const MAX_AUDIT_ENTRIES = 200;
const auditEntries: AuditEntry[] = [];

function sortAuditDesc(entries: AuditEntry[]) {
  return [...entries].sort((left, right) =>
    right.timestamp.localeCompare(left.timestamp)
  );
}

export async function appendAuditEntry(entry: AuditEntry) {
  auditEntries.unshift(entry);

  if (auditEntries.length > MAX_AUDIT_ENTRIES) {
    auditEntries.length = MAX_AUDIT_ENTRIES;
  }
}

export async function listStoredAuditEntries(limit = 20) {
  return sortAuditDesc(auditEntries).slice(0, Math.max(0, limit));
}
