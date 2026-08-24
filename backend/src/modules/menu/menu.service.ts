import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { CreateMenuItemInput, UpdateMenuItemInput, ListMenuItemsQuery } from './menu.validation';
import { Prisma } from '@prisma/client';

export async function listMenuItems(query: ListMenuItemsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.MenuItemWhereInput = {
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.isAvailable !== undefined ? { isAvailable: query.isAvailable } : {}),
    ...(query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.menuItem.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getMenuItemById(id: string) {
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      recipes: {
        include: { ingredient: { select: { id: true, name: true, unit: true } } },
      },
    },
  });

  if (!item) {
    throw new AppError('Menu item not found', 404);
  }

  return item;
}

export async function createMenuItem(input: CreateMenuItemInput, imageUrl?: string) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const item = await prisma.menuItem.create({
    data: {
      ...input,
      imageUrl,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return item;
}

export async function updateMenuItem(id: string, input: UpdateMenuItemInput, imageUrl?: string) {
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Menu item not found', 404);
  }

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      ...input,
      ...(imageUrl ? { imageUrl } : {}),
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return item;
}

export async function deleteMenuItem(id: string) {
  const orderItemCount = await prisma.orderItem.count({ where: { menuItemId: id } });
  if (orderItemCount > 0) {
    throw new AppError(
      'Cannot delete a menu item that appears in existing orders — mark it unavailable instead',
      409
    );
  }

  await prisma.menuItem.delete({ where: { id } });
}