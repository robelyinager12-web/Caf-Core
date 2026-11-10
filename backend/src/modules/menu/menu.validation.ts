import { z } from 'zod';

const positiveIntegerQuery = (fallback: number, max = Number.MAX_SAFE_INTEGER) =>
  z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(max))
    .optional()
    .transform((value) => value ?? fallback)
    .catch(fallback);

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(2).max(150),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive('Price must be greater than zero'),
  isAvailable: z.coerce.boolean().optional().default(true),
});

export const updateMenuItemSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive().optional(),
  isAvailable: z.coerce.boolean().optional(),
});

export const listMenuItemsQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  isAvailable: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  search: z.string().max(150).optional(),
  page: positiveIntegerQuery(1, 1_000_000),
  limit: positiveIntegerQuery(20).transform((value) => Math.min(value, 100)),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type ListMenuItemsQuery = z.infer<typeof listMenuItemsQuerySchema>;