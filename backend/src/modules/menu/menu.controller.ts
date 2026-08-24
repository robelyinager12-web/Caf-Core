import { Response, NextFunction } from 'express';
import { createMenuItemSchema, updateMenuItemSchema, listMenuItemsQuerySchema } from './menu.validation';
import { listMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } from './menu.service';
import { sendSuccess } from '../../utils/apiResponse';
import { logAudit } from '../audit/audit.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';

function buildImageUrl(req: AuthenticatedRequest): string | undefined {
  if (!req.file) return undefined;
  return `/uploads/menu-images/${req.file.filename}`;
}

export async function getMenuItems(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = listMenuItemsQuerySchema.parse(req.query);
    const result = await listMenuItems(query);
    sendSuccess(res, 200, {
      message: 'Menu items retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const item = await getMenuItemById(req.params.id);
    sendSuccess(res, 200, { message: 'Menu item retrieved successfully', data: item });
  } catch (error) {
    next(error);
  }
}

export async function postMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createMenuItemSchema.parse(req.body);
    const imageUrl = buildImageUrl(req);
    const item = await createMenuItem(input, imageUrl);

    await logAudit({
      userId: req.user?.userId,
      action: 'MENU_ITEM_CREATED',
      entityType: 'MenuItem',
      entityId: item.id,
      metadata: { name: item.name, price: item.price },
    });

    sendSuccess(res, 201, { message: 'Menu item created successfully', data: item });
  } catch (error) {
    next(error);
  }
}

export async function patchMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = updateMenuItemSchema.parse(req.body);
    const imageUrl = buildImageUrl(req);
    const item = await updateMenuItem(req.params.id, input, imageUrl);

    await logAudit({
      userId: req.user?.userId,
      action: 'MENU_ITEM_UPDATED',
      entityType: 'MenuItem',
      entityId: item.id,
      metadata: { changes: input },
    });

    sendSuccess(res, 200, { message: 'Menu item updated successfully', data: item });
  } catch (error) {
    next(error);
  }
}

export async function removeMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await deleteMenuItem(req.params.id);

    await logAudit({
      userId: req.user?.userId,
      action: 'MENU_ITEM_DELETED',
      entityType: 'MenuItem',
      entityId: req.params.id,
    });

    sendSuccess(res, 200, { message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
}