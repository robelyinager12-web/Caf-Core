"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
exports.listAuditLogs = listAuditLogs;
exports.getDistinctActions = getDistinctActions;
const db_1 = require("../../config/db");
async function logAudit(input) {
    await db_1.prisma.auditLog.create({
        data: {
            userId: input.userId ?? null,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId ?? null,
            metadata: input.metadata,
        },
    });
}
async function listAuditLogs(query) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;
    const where = {
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
        db_1.prisma.auditLog.findMany({
            where,
            include: { user: { select: { id: true, fullName: true, role: true } } },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        db_1.prisma.auditLog.count({ where }),
    ]);
    return { logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function getDistinctActions() {
    const results = await db_1.prisma.auditLog.findMany({
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' },
    });
    return results.map((r) => r.action);
}
