import { prisma } from '../../config/db';
import { ListAuditLogsQuery } from './audit.validation';
import { Prisma } from '@prisma/client';

interface AuditInput {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAudit(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function listAuditLogs(query: ListAuditLogsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 25;
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {
    ...(query.action ? { action: query.action } : {}),
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          createdAt: {
            ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
            ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, fullName: true, role: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getDistinctActions(): Promise<string[]> {
  const results = await prisma.auditLog.findMany({
    select: { action: true },
    distinct: ['action'],
    orderBy: { action: 'asc' },
  });
  return results.map((r) => r.action);
}