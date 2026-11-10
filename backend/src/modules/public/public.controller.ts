import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { sendError, sendSuccess } from '../../utils/apiResponse';
import { listMenuItems } from '../menu/menu.service';
import { listMenuItemsQuerySchema } from '../menu/menu.validation';

export async function getPublicMenu(req: Request, res: Response): Promise<void> {
  try {
    const query = listMenuItemsQuerySchema.parse(req.query);
    const result = await listMenuItems({ ...query, isAvailable: true });

    sendSuccess(res, 200, {
      message: 'Available menu items retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      sendError(res, 422, 'Validation failed', error.flatten().fieldErrors);
      return;
    }

    console.error('Failed to retrieve public menu:', error);
    sendError(res, 500, 'Failed to retrieve public menu');
  }
}
