import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { UpdateUserInput, ListUsersQuery } from './user.validation';

const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listUsers(query: ListUsersQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: SAFE_USER_SELECT,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: SAFE_USER_SELECT,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export async function updateUser(id: string, input: UpdateUserInput, actingUserId: string) {
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    throw new AppError('User not found', 404);
  }

  if (id === actingUserId && input.isActive === false) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  if (id === actingUserId && input.role && input.role !== targetUser.role) {
    throw new AppError('You cannot change your own role', 400);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: input,
    select: SAFE_USER_SELECT,
  });

  return updated;
}

export async function deactivateUser(id: string, actingUserId: string) {
  if (id === actingUserId) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: SAFE_USER_SELECT,
  });

  return updated;
}