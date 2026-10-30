"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const zod_1 = require("zod");
const db_1 = require("../../config/db");
const apiResponse_1 = require("../../utils/apiResponse");
const errorHandler_1 = require("../../middlewares/errorHandler");
const audit_service_1 = require("../audit/audit.service");
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    displayOrder: zod_1.z.number().int().min(0).optional(),
});
async function listCategories(_req, res, next) {
    try {
        const categories = await db_1.prisma.category.findMany({
            orderBy: { displayOrder: 'asc' },
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Categories retrieved successfully', data: categories });
    }
    catch (error) {
        next(error);
    }
}
async function createCategory(req, res, next) {
    try {
        const input = categorySchema.parse(req.body);
        const category = await db_1.prisma.category.create({ data: input });
        await (0, audit_service_1.logAudit)({
            userId: req.user?.userId,
            action: 'CATEGORY_CREATED',
            entityType: 'Category',
            entityId: category.id,
            metadata: { name: category.name },
        });
        (0, apiResponse_1.sendSuccess)(res, 201, { message: 'Category created successfully', data: category });
    }
    catch (error) {
        next(error);
    }
}
async function updateCategory(req, res, next) {
    try {
        const input = categorySchema.partial().parse(req.body);
        const category = await db_1.prisma.category.update({
            where: { id: req.params.id },
            data: input,
        });
        await (0, audit_service_1.logAudit)({
            userId: req.user?.userId,
            action: 'CATEGORY_UPDATED',
            entityType: 'Category',
            entityId: category.id,
            metadata: { changes: input },
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Category updated successfully', data: category });
    }
    catch (error) {
        next(error);
    }
}
async function deleteCategory(req, res, next) {
    try {
        const itemCount = await db_1.prisma.menuItem.count({ where: { categoryId: req.params.id } });
        if (itemCount > 0) {
            throw new errorHandler_1.AppError(`Cannot delete category with ${itemCount} menu item(s) still assigned to it`, 409);
        }
        await db_1.prisma.category.delete({ where: { id: req.params.id } });
        await (0, audit_service_1.logAudit)({
            userId: req.user?.userId,
            action: 'CATEGORY_DELETED',
            entityType: 'Category',
            entityId: req.params.id,
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Category deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
