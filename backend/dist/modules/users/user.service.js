"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deactivateUser = deactivateUser;
const db_1 = require("../../config/db");
const errorHandler_1 = require("../../middlewares/errorHandler");
const SAFE_USER_SELECT = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};
async function listUsers(query) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
        ...(query.role ? { role: query.role } : {}),
        ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const [users, total] = await Promise.all([
        db_1.prisma.user.findMany({
            where,
            select: SAFE_USER_SELECT,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        db_1.prisma.user.count({ where }),
    ]);
    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function getUserById(id) {
    const user = await db_1.prisma.user.findUnique({
        where: { id },
        select: SAFE_USER_SELECT,
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    return user;
}
async function updateUser(id, input, actingUserId) {
    const targetUser = await db_1.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    if (id === actingUserId && input.isActive === false) {
        throw new errorHandler_1.AppError('You cannot deactivate your own account', 400);
    }
    if (id === actingUserId && input.role && input.role !== targetUser.role) {
        throw new errorHandler_1.AppError('You cannot change your own role', 400);
    }
    const updated = await db_1.prisma.user.update({
        where: { id },
        data: input,
        select: SAFE_USER_SELECT,
    });
    return updated;
}
async function deactivateUser(id, actingUserId) {
    if (id === actingUserId) {
        throw new errorHandler_1.AppError('You cannot deactivate your own account', 400);
    }
    const user = await db_1.prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const updated = await db_1.prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: SAFE_USER_SELECT,
    });
    return updated;
}
