import { Response, NextFunction } from 'express';
import {
  createIngredientSchema,
  adjustStockSchema,
  updateThresholdSchema,
  listIngredientsQuerySchema,
} from './inventory.validation';
import {
  listIngredients,
  createIngredient,
  adjustStock,
  updateThreshold,
} from './inventory.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { AppError } from '../../middlewares/errorHandler';

export async function getIngredients(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = listIngredientsQuerySchema.parse(req.query);
    const result = await listIngredients(query);
    sendSuccess(res, 200, {
      message: 'Ingredients retrieved successfully',
      data: result.ingredients,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function postIngredient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createIngredientSchema.parse(req.body);
    const ingredient = await createIngredient(input);
    sendSuccess(res, 201, { message: 'Ingredient created successfully', data: ingredient });
  } catch (error) {
    next(error);
  }
}

export async function postStockAdjustment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const input = adjustStockSchema.parse(req.body);
    const inventory = await adjustStock(req.params.ingredientId, input, req.user.userId);

    sendSuccess(res, 200, { message: 'Stock adjusted successfully', data: inventory });
  } catch (error) {
    next(error);
  }
}

export async function patchThreshold(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = updateThresholdSchema.parse(req.body);
    const inventory = await updateThreshold(req.params.ingredientId, input.lowStockThreshold);
    sendSuccess(res, 200, { message: 'Low stock threshold updated successfully', data: inventory });
  } catch (error) {
    next(error);
  }
}