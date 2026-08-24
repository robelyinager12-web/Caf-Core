import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db';
import { sendSuccess } from '../../utils/apiResponse';
import { AppError } from '../../middlewares/errorHandler';
import { logAudit } from '../audit/audit.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const recipeSchema = z.object({
  menuItemId: z.string().uuid(),
  ingredientId: z.string().uuid(),
  quantityRequired: z.coerce.number().positive(),
});

export async function getRecipesForMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { menuItemId: req.params.menuItemId },
      include: { ingredient: { select: { id: true, name: true, unit: true } } },
    });
    sendSuccess(res, 200, { message: 'Recipe retrieved successfully', data: recipes });
  } catch (error) {
    next(error);
  }
}

export async function upsertRecipeLine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = recipeSchema.parse(req.body);

    const [menuItem, ingredient] = await Promise.all([
      prisma.menuItem.findUnique({ where: { id: input.menuItemId } }),
      prisma.ingredient.findUnique({ where: { id: input.ingredientId } }),
    ]);

    if (!menuItem) throw new AppError('Menu item not found', 404);
    if (!ingredient) throw new AppError('Ingredient not found', 404);

    const recipe = await prisma.recipe.upsert({
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

    await logAudit({
      userId: req.user?.userId,
      action: 'RECIPE_LINE_UPSERTED',
      entityType: 'Recipe',
      entityId: recipe.id,
      metadata: input,
    });

    sendSuccess(res, 200, { message: 'Recipe line saved successfully', data: recipe });
  } catch (error) {
    next(error);
  }
}

export async function removeRecipeLine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await prisma.recipe.delete({ where: { id: req.params.id } });

    await logAudit({
      userId: req.user?.userId,
      action: 'RECIPE_LINE_DELETED',
      entityType: 'Recipe',
      entityId: req.params.id,
    });

    sendSuccess(res, 200, { message: 'Recipe line removed successfully' });
  } catch (error) {
    next(error);
  }
}