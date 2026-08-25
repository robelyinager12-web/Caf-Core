export interface AuditLog {
  id: string;
  userId: string | null;
  user: { id: string; fullName: string; role: string } | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}