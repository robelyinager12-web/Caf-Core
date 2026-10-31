import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/apiResponse';
import { listMenuItems } from '../menu/menu.service';
import { listMenuItemsQuerySchema } from '../menu/menu.validation';

export async function getPublicMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listMenuItemsQuerySchema.parse(req.query);
    const result = await listMenuItems({ ...query, isAvailable: true });

    sendSuccess(res, 200, {
      message: 'Available menu items retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}
