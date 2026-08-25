import { z } from 'zod';

export const listAuditLogsQuerySchema = z.object({
  action: z.string().max(100).optional(),
  entityType: z.string().max(50).optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => Math.min(val ? parseInt(val, 10) : 25, 100)),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;