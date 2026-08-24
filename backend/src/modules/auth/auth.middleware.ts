import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errorHandler';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication token missing', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret) as {
      userId: string;
      role: Role;
    };
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
}