import { prisma } from '../../config/db';
import { NotificationType, Role } from '@prisma/client';
import { getIO } from '../../config/socket';

interface CreateNotificationInput {
  type: NotificationType;
  message: string;
  targetRole?: Role;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      type: input.type,
      message: input.message,
      targetRole: input.targetRole,
    },
  });

  try {
    const io = getIO();
    if (input.targetRole) {
      io.to(`role:${input.targetRole}`).emit('notification:new', notification);
    } else {
      io.emit('notification:new', notification);
    }
  } catch {
    // Socket server not yet initialized (e.g., during tests) — notification is
    // still persisted to the database and will be visible on next fetch.
  }

  return notification;
}

export async function listNotifications(role: Role, unreadOnly = false) {
  return prisma.notification.findMany({
    where: {
      OR: [{ targetRole: role }, { targetRole: null }],
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}