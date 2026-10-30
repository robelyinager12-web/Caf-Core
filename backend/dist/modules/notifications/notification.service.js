"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.listNotifications = listNotifications;
exports.markNotificationRead = markNotificationRead;
const db_1 = require("../../config/db");
const socket_1 = require("../../config/socket");
async function createNotification(input) {
    const notification = await db_1.prisma.notification.create({
        data: {
            type: input.type,
            message: input.message,
            targetRole: input.targetRole,
        },
    });
    try {
        const io = (0, socket_1.getIO)();
        if (input.targetRole) {
            io.to(`role:${input.targetRole}`).emit('notification:new', notification);
        }
        else {
            io.emit('notification:new', notification);
        }
    }
    catch {
        // Socket server not yet initialized (e.g., during tests) — notification is
        // still persisted to the database and will be visible on next fetch.
    }
    return notification;
}
async function listNotifications(role, unreadOnly = false) {
    return db_1.prisma.notification.findMany({
        where: {
            OR: [{ targetRole: role }, { targetRole: null }],
            ...(unreadOnly ? { isRead: false } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
}
async function markNotificationRead(id) {
    return db_1.prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });
}
