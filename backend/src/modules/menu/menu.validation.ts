import { z } from 'zod';

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
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => Math.min(val ? parseInt(val, 10) : 20, 100)),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type ListMenuItemsQuery = z.infer<typeof listMenuItemsQuerySchema>;