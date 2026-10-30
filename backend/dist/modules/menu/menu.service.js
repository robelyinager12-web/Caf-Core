"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMenuItems = listMenuItems;
exports.getMenuItemById = getMenuItemById;
exports.createMenuItem = createMenuItem;
exports.updateMenuItem = updateMenuItem;
exports.deleteMenuItem = deleteMenuItem;
const db_1 = require("../../config/db");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function listMenuItems(query) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.isAvailable !== undefined ? { isAvailable: query.isAvailable } : {}),
        ...(query.search
            ? { name: { contains: query.search, mode: 'insensitive' } }
            : {}),
    };
    const [items, total] = await Promise.all([
        db_1.prisma.menuItem.findMany({
            where,
            include: { category: { select: { id: true, name: true } } },
            skip,
            take: limit,
            orderBy: { name: 'asc' },
        }),
        db_1.prisma.menuItem.count({ where }),
    ]);
    return {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function getMenuItemById(id) {
    const item = await db_1.prisma.menuItem.findUnique({
        where: { id },
        include: {
            category: { select: { id: true, name: true } },
            recipes: {
                include: { ingredient: { select: { id: true, name: true, unit: true } } },
            },
        },
    });
    if (!item) {
        throw new errorHandler_1.AppError('Menu item not found', 404);
    }
    return item;
}
async function createMenuItem(input, imageUrl) {
    const category = await db_1.prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) {
        throw new errorHandler_1.AppError('Category not found', 404);
    }
    const item = await db_1.prisma.menuItem.create({
        data: {
            ...input,
            imageUrl,
        },
        include: { category: { select: { id: true, name: true } } },
    });
    return item;
}
async function updateMenuItem(id, input, imageUrl) {
    const existing = await db_1.prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
        throw new errorHandler_1.AppError('Menu item not found', 404);
    }
    if (input.categoryId) {
        const category = await db_1.prisma.category.findUnique({ where: { id: input.categoryId } });
        if (!category) {
            throw new errorHandler_1.AppError('Category not found', 404);
        }
    }
    const item = await db_1.prisma.menuItem.update({
        where: { id },
        data: {
            ...input,
            ...(imageUrl ? { imageUrl } : {}),
        },
        include: { category: { select: { id: true, name: true } } },
    });
    return item;
}
async function deleteMenuItem(id) {
    const orderItemCount = await db_1.prisma.orderItem.count({ where: { menuItemId: id } });
    if (orderItemCount > 0) {
        throw new errorHandler_1.AppError('Cannot delete a menu item that appears in existing orders — mark it unavailable instead', 409);
    }
    await db_1.prisma.menuItem.delete({ where: { id } });
}
