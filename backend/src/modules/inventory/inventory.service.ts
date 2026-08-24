import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import {
  CreateIngredientInput,
  AdjustStockInput,
  ListIngredientsQuery,
} from './inventory.validation';
import { Prisma } from '@prisma/client';
import { createNotification } from '../notifications/notification.service';

export async function listIngredients(query: ListIngredientsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.IngredientWhereInput = {
    ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
  };

  const [ingredients, total] = await Promise.all([
    prisma.ingredient.findMany({
      where,
      include: { inventory: true },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.ingredient.count({ where }),
  ]);

  const filtered = query.lowStockOnly
    ? ingredients.filter(
        (i) => i.inventory && i.inventory.quantityInStock.lessThanOrEqualTo(i.inventory.lowStockThreshold)
      )
    : ingredients;

  return {
    ingredients: filtered,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function createIngredient(input: CreateIngredientInput) {
  const existing = await prisma.ingredient.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new AppError('An ingredient with this name already exists', 409);
  }

  const ingredient = await prisma.ingredient.create({
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

export async function adjustStock(ingredientId: string, input: AdjustStockInput, userId: string) {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
    include: { inventory: true },
  });

  if (!ingredient || !ingredient.inventory) {
    throw new AppError('Ingredient or inventory record not found', 404);
  }

  const newQuantity = ingredient.inventory.quantityInStock.toNumber() + input.quantityChange;
  if (newQuantity < 0) {
    throw new AppError('Stock adjustment would result in negative quantity', 400);
  }

  const updatedInventory = await prisma.inventory.update({
    where: { ingredientId },
    data: { quantityInStock: newQuantity },
  });

  await prisma.auditLog.create({
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
    await createNotification({
      type: 'LOW_STOCK',
      message: `${ingredient.name} is running low (${newQuantity} ${ingredient.unit} remaining)`,
      targetRole: 'MANAGER',
    });
  }

  return updatedInventory;
}

export async function updateThreshold(ingredientId: string, lowStockThreshold: number) {
  const inventory = await prisma.inventory.findUnique({ where: { ingredientId } });
  if (!inventory) {
    throw new AppError('Inventory record not found', 404);
  }

  return prisma.inventory.update({
    where: { ingredientId },
    data: { lowStockThreshold },
  });
}

/**
 * Deducts recipe-required ingredient quantities from inventory for every item
 * in a completed order. Called by the orders module when an order is marked COMPLETED.
 * Runs inside the caller's transaction to keep order completion and stock deduction atomic.
 */
export async function deductInventoryForOrder(
  tx: Prisma.TransactionClient,
  orderItems: { menuItemId: string; quantity: number }[]
) {
  for (const orderItem of orderItems) {
    const recipes = await tx.recipe.findMany({
      where: { menuItemId: orderItem.menuItemId },
      include: { ingredient: { include: { inventory: true } } },
    });

    for (const recipe of recipes) {
      if (!recipe.ingredient.inventory) continue;

      const totalRequired = recipe.quantityRequired.toNumber() * orderItem.quantity;
      const currentStock = recipe.ingredient.inventory.quantityInStock.toNumber();
      const newStock = Math.max(0, currentStock - totalRequired);

      const updated = await tx.inventory.update({
        where: { ingredientId: recipe.ingredientId },
        data: { quantityInStock: newStock },
      });

      if (updated.quantityInStock.lessThanOrEqualTo(updated.lowStockThreshold)) {
        await createNotification({
          type: 'LOW_STOCK',
          message: `${recipe.ingredient.name} is running low (${newStock} ${recipe.ingredient.unit} remaining)`,
          targetRole: 'MANAGER',
        });
      }
    }
  }
}