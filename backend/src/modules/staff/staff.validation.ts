import { z } from 'zod';

export const clockInSchema = z.object({
  userId: z.string().uuid().optional(), // Admin/Manager can clock in on behalf of staff; omitted = self
});

export const listShiftsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  activeOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => Math.min(val ? parseInt(val, 10) : 20, 100)),
});

export type ClockInInput = z.infer<typeof clockInSchema>;
export type ListShiftsQuery = z.infer<typeof listShiftsQuerySchema>;