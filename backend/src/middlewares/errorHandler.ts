import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { sendError } from '../utils/apiResponse';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    sendError(res, 422, 'Validation failed', err.flatten().fieldErrors);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 409, `A record with this ${err.meta?.target ?? 'value'} already exists`);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 404, 'Record not found');
      return;
    }
  }

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  logger.error('Unhandled error', { error: err, path: req.path, method: req.method });
  sendError(res, 500, 'Internal server error');
}