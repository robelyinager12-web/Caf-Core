import { z } from 'zod';

export const dateRangeSchema = z.object({
  dateFrom: z.string().datetime('dateFrom must be a valid ISO date'),
  dateTo: z.string().datetime('dateTo must be a valid ISO date'),
});

export const topItemsQuerySchema = dateRangeSchema.extend({
  limit: z
    .string()
    .optional()
    .transform((val) => Math.min(val ? parseInt(val, 10) : 10, 50)),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type TopItemsQuery = z.infer<typeof topItemsQuerySchema>;