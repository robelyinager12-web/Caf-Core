import { Response } from 'express';

interface ApiSuccessOptions<T> {
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  { message = 'Success', data, meta }: ApiSuccessOptions<T>
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    meta: meta ?? undefined,
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? undefined,
  });
}