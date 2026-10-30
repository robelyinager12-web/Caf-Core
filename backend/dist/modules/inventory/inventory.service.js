"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIngredients = listIngredients;
exports.createIngredient = createIngredient;
exports.adjustStock = adjustStock;
exports.updateThreshold = updateThreshold;
exports.deductInventoryForOrder = deductInventoryForOrder;
const db_1 = require("../../config/db");
const errorHandler_1 = require("../../middlewares/errorHandler");
const notification_service_1 = require("../notifications/notification.service");
async function listIngredients(query) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
        ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [ingredients, total] = await Promise.all([
        db_1.prisma.ingredient.findMany({
            where,
            include: { inventory: true },
            skip,
            take: limit,
            orderBy: { name: 'asc' },
        }),
        db_1.prisma.ingredient.count({ where }),
    ]);
    const filtered = query.lowStockOnly
        ? ingredients.filter((i) => i.inventory && i.inventory.quantityInStock.lessThanOrEqualTo(i.inventory.lowStockThreshold))
        : ingredients;
    return {
        ingredients: filtered,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function createIngredient(input) {
    const existing = await db_1.prisma.ingredient.findUnique({ where: { name: input.name } });
    if (existing) {
        throw new errorHandler_1.AppError('An ingredient with this name already exists', 409);
    }
    const ingredient = await db_1.prisma.ingredient.create({
        data: {
            name: input.name,
            unit: input.unit,
            inventory: {
                create: {
                    quantityInStock: input.initialQuantity,
                    lowStockThreshold: input.lowStockThreshold,
                },
            },
        },
        include: { inventory: true },
    });
    return ingredient;
}
async function adjustStock(ingredientId, input, userId) {
    const ingredient = await db_1.prisma.ingredient.findUnique({
        where: { id: ingredientId },
        include: { inventory: true },
    });
    if (!ingredient || !ingredient.inventory) {
        throw new errorHandler_1.AppError('Ingredient or inventory record not found', 404);
    }
    const newQuantity = ingredient.inventory.quantityInStock.toNumber() + input.quantityChange;
    if (newQuantity < 0) {
        throw new errorHandler_1.AppError('Stock adjustment would result in negative quantity', 400);
    }
    const updatedInventory = await db_1.prisma.inventory.update({
        where: { ingredientId },
        data: { quantityInStock: newQuantity },
    });
    await db_1.prisma.auditLog.create({
        data: {
            userId,
            action: 'STOCK_ADJUSTED',
            entityType: 'Inventory',
            entityId: updatedInventory.id,
            metadata: {
                ingredientName: ingredient.name,
                quantityChange: input.quantityChange,
                reason: input.reason,
                newQuantity,
            },
        },
    });
    if (updatedInventory.quantityInStock.lessThanOrEqualTo(updatedInventory.lowStockThreshold)) {
        await (0, notification_service_1.createNotification)({
            type: 'LOW_STOCK',
            message: `${ingredient.name} is running low (${newQuantity} ${ingredient.unit} remaining)`,
            targetRole: 'MANAGER',
        });
    }
    return updatedInventory;
}
async function updateThreshold(ingredientId, lowStockThreshold) {
    const inventory = await db_1.prisma.inventory.findUnique({ where: { ingredientId } });
    if (!inventory) {
        throw new errorHandler_1.AppError('Inventory record not found', 404);
    }
    return db_1.prisma.inventory.update({
        where: { ingredientId },
        data: { lowStockThreshold },
    });
}
/**
 * Deducts recipe-required ingredient quantities from inventory for every item
 * in a completed order. Called by the orders module when an order is marked COMPLETED.
 * Runs inside the caller's transaction to keep order completion and stock deduction atomic.
 */
async function deductInventoryForOrder(tx, orderItems) {
    for (const orderItem of orderItems) {
        const recipes = await tx.recipe.findMany({
            where: { menuItemId: orderItem.menuItemId },
            include: { ingredient: { include: { inventory: true } } },
        });
        for (const recipe of recipes) {
            if (!recipe.ingredient.inventory)
                continue;
            const totalRequired = recipe.quantityRequired.toNumber() * orderItem.quantity;
            const currentStock = recipe.ingredient.inventory.quantityInStock.toNumber();
            const newStock = Math.max(0, currentStock - totalRequired);
            const updated = await tx.inventory.update({
                where: { ingredientId: recipe.ingredientId },
                data: { quantityInStock: newStock },
            });
            if (updated.quantityInStock.lessThanOrEqualTo(updated.lowStockThreshold)) {
                await (0, notification_service_1.createNotification)({
                    type: 'LOW_STOCK',
                    message: `${recipe.ingredient.name} is running low (${newStock} ${recipe.ingredient.unit} remaining)`,
                    targetRole: 'MANAGER',
                });
            }
        }
    }
}
