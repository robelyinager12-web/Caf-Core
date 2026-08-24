import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db';
import { sendSuccess } from '../../utils/apiResponse';
import { AppError } from '../../middlewares/errorHandler';
import { logAudit } from '../audit/audit.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  displayOrder: z.number().int().min(0).optional(),
});

export async function listCategories(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    sendSuccess(res, 200, { message: 'Categories retrieved successfully', data: categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data: input });

    await logAudit({
      userId: req.user?.userId,
      action: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityId: category.id,
      metadata: { name: category.name },
    });

    sendSuccess(res, 201, { message: 'Category created successfully', data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = categorySchema.partial().parse(req.body);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: input,
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'CATEGORY_UPDATED',
      entityType: 'Category',
      entityId: category.id,
      metadata: { changes: input },
    });

    sendSuccess(res, 200, { message: 'Category updated successfully', data: category });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const itemCount = await prisma.menuItem.count({ where: { categoryId: req.params.id } });
    if (itemCount > 0) {
      throw new AppError(
        `Cannot delete category with ${itemCount} menu item(s) still assigned to it`,
        409
      );
    }

    await prisma.category.delete({ where: { id: req.params.id } });

    await logAudit({
      userId: req.user?.userId,
      action: 'CATEGORY_DELETED',
      entityType: 'Category',
      entityId: req.params.id,
    });

    sendSuccess(res, 200, { message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
}