import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { ListShiftsQuery } from './staff.validation';
import { Prisma, Role } from '@prisma/client';

export async function clockIn(targetUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 404);
  }

  const openShift = await prisma.staffShift.findFirst({
    where: { userId: targetUserId, shiftEnd: null },
  });

  if (openShift) {
    throw new AppError('This user already has an open shift — clock out first', 409);
  }

  return prisma.staffShift.create({
    data: { userId: targetUserId, shiftStart: new Date() },
    include: { user: { select: { id: true, fullName: true, role: true } } },
  });
}

export async function clockOut(targetUserId: string) {
  const openShift = await prisma.staffShift.findFirst({
    where: { userId: targetUserId, shiftEnd: null },
    orderBy: { shiftStart: 'desc' },
  });

  if (!openShift) {
    throw new AppError('No open shift found for this user', 404);
  }

  return prisma.staffShift.update({
    where: { id: openShift.id },
    data: { shiftEnd: new Date() },
    include: { user: { select: { id: true, fullName: true, role: true } } },
  });
}

export async function listShifts(
  query: ListShiftsQuery,
  callerId: string,
  callerRole: Role
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const isPrivileged = callerRole === 'ADMIN' || callerRole === 'MANAGER';

  // A non-privileged caller may only ever see their own shifts, regardless
  // of what userId they pass (or omit) in the query — this is enforced here
  // rather than trusted from the request.
  const effectiveUserId = isPrivileged ? query.userId : callerId;

  const where: Prisma.StaffShiftWhereInput = {
    ...(effectiveUserId ? { userId: effectiveUserId } : {}),
    ...(query.activeOnly ? { shiftEnd: null } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          shiftStart: {
            ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
            ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
          },
        }
      : {}),
  };

  const [shifts, total] = await Promise.all([
    prisma.staffShift.findMany({
      where,
      include: { user: { select: { id: true, fullName: true, role: true } } },
      skip,
      take: limit,
      orderBy: { shiftStart: 'desc' },
    }),
    prisma.staffShift.count({ where }),
  ]);

  return { shifts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getCurrentlyActiveStaff() {
  return prisma.staffShift.findMany({
    where: { shiftEnd: null },
    include: { user: { select: { id: true, fullName: true, role: true } } },
    orderBy: { shiftStart: 'asc' },
  });
}