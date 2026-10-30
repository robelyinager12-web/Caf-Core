"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipesForMenuItem = getRecipesForMenuItem;
exports.upsertRecipeLine = upsertRecipeLine;
exports.removeRecipeLine = removeRecipeLine;
const zod_1 = require("zod");
const db_1 = require("../../config/db");
const apiResponse_1 = require("../../utils/apiResponse");
const errorHandler_1 = require("../../middlewares/errorHandler");
const audit_service_1 = require("../audit/audit.service");
const recipeSchema = zod_1.z.object({
    menuItemId: zod_1.z.string().uuid(),
    ingredientId: zod_1.z.string().uuid(),
    quantityRequired: zod_1.z.coerce.number().positive(),
});
async function getRecipesForMenuItem(req, res, next) {
    try {
        const recipes = await db_1.prisma.recipe.findMany({
            where: { menuItemId: req.params.menuItemId },
            include: { ingredient: { select: { id: true, name: true, unit: true } } },
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Recipe retrieved successfully', data: recipes });
    }
    catch (error) {
        next(error);
    }
}
async function upsertRecipeLine(req, res, next) {
    try {
        const input = recipeSchema.parse(req.body);
        const [menuItem, ingredient] = await Promise.all([
            db_1.prisma.menuItem.findUnique({ where: { id: input.menuItemId } }),
            db_1.prisma.ingredient.findUnique({ where: { id: input.ingredientId } }),
        ]);
        if (!menuItem)
            throw new errorHandler_1.AppError('Menu item not found', 404);
        if (!ingredient)
            throw new errorHandler_1.AppError('Ingredient not found', 404);
        const recipe = await db_1.prisma.recipe.upsert({
            where: {
                uq_recipe_item_ingredient: {
                    menuItemId: input.menuItemId,
                    ingredientId: input.ingredientId,
                },
            },
            update: { quantityRequired: input.quantityRequired },
            create: input,
            include: { ingredient: { select: { id: true, name: true, unit: true } } },
        });
        await (0, audit_service_1.logAudit)({
            userId: req.user?.userId,
            action: 'RECIPE_LINE_UPSERTED',
            entityType: 'Recipe',
            entityId: recipe.id,
            metadata: input,
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Recipe line saved successfully', data: recipe });
    }
    catch (error) {
        next(error);
    }
}
async function removeRecipeLine(req, res, next) {
    try {
        await db_1.prisma.recipe.delete({ where: { id: req.params.id } });
        await (0, audit_service_1.logAudit)({
            userId: req.user?.userId,
            action: 'RECIPE_LINE_DELETED',
            entityType: 'Recipe',
            entityId: req.params.id,
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Recipe line removed successfully' });
    }
    catch (error) {
        next(error);
    }
}
