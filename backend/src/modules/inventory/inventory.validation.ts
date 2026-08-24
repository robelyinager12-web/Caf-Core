import { z } from 'zod';

export const createIngredientSchema = z.object({
  name: z.string().min(2).max(150),
  unit: z.string().min(1).max(20),
  initialQuantity: z.coerce.number().min(0).optional().default(0),
  lowStockThreshold: z.coerce.number().min(0).optional().default(10),
});

export const adjustStockSchema = z.object({
  quantityChange: z.coerce
    .number()
    .refine((val) => val !== 0, 'Quantity change cannot be zero'),
  reason: z.string().min(2).max(255),
});

export const updateThresholdSchema = z.object({
  lowStockThreshold: z.coerce.number().min(0),
});

export const listIngredientsQuerySchema = z.object({
  lowStockOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  search: z.string().max(150).optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => Math.min(val ? parseInt(val, 10) : 20, 100)),
});

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type UpdateThresholdInput = z.infer<typeof updateThresholdSchema>;
export type ListIngredientsQuery = z.infer<typeof listIngredientsQuerySchema>;