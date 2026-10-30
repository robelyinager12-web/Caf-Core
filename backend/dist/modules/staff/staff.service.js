"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clockIn = clockIn;
exports.clockOut = clockOut;
exports.listShifts = listShifts;
exports.getCurrentlyActiveStaff = getCurrentlyActiveStaff;
const db_1 = require("../../config/db");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function clockIn(targetUserId) {
    const user = await db_1.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user || !user.isActive) {
        throw new errorHandler_1.AppError('User not found or inactive', 404);
    }
    const openShift = await db_1.prisma.staffShift.findFirst({
        where: { userId: targetUserId, shiftEnd: null },
    });
    if (openShift) {
        throw new errorHandler_1.AppError('This user already has an open shift — clock out first', 409);
    }
    return db_1.prisma.staffShift.create({
        data: { userId: targetUserId, shiftStart: new Date() },
        include: { user: { select: { id: true, fullName: true, role: true } } },
    });
}
async function clockOut(targetUserId) {
    const openShift = await db_1.prisma.staffShift.findFirst({
        where: { userId: targetUserId, shiftEnd: null },
        orderBy: { shiftStart: 'desc' },
    });
    if (!openShift) {
        throw new errorHandler_1.AppError('No open shift found for this user', 404);
    }
    return db_1.prisma.staffShift.update({
        where: { id: openShift.id },
        data: { shiftEnd: new Date() },
        include: { user: { select: { id: true, fullName: true, role: true } } },
    });
}
async function listShifts(query, callerId, callerRole) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const isPrivileged = callerRole === 'ADMIN' || callerRole === 'MANAGER';
    // A non-privileged caller may only ever see their own shifts, regardless
    // of what userId they pass (or omit) in the query — this is enforced here
    // rather than trusted from the request.
    const effectiveUserId = isPrivileged ? query.userId : callerId;
    const where = {
        ...(effectiveUserId ? { userId: effectiveUserId } : {}),
        ...(query.activeOnly ? { shiftEnd: null } : {}),
        ...(query.dateFrom || query.dateTo
            ? {
                shiftStart: {
                    ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
                    ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
                },
            }
            : {}),
    };
    const [shifts, total] = await Promise.all([
        db_1.prisma.staffShift.findMany({
            where,
            include: { user: { select: { id: true, fullName: true, role: true } } },
            skip,
            take: limit,
            orderBy: { shiftStart: 'desc' },
        }),
        db_1.prisma.staffShift.count({ where }),
    ]);
    return { shifts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function getCurrentlyActiveStaff() {
    return db_1.prisma.staffShift.findMany({
        where: { shiftEnd: null },
        include: { user: { select: { id: true, fullName: true, role: true } } },
        orderBy: { shiftStart: 'asc' },
    });
}
