import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env';
import { logger } from '../utils/logger';
import { Role } from '@prisma/client';

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      next(new Error('Authentication token missing'));
      return;
    }

    try {
      const decoded = jwt.verify(token, env.jwt.accessSecret) as { userId: string; role: Role };
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const role = socket.data.role as Role;
    socket.join(`role:${role}`);
    logger.info(`Socket connected: user ${socket.data.userId} (${role})`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${socket.data.userId}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
}