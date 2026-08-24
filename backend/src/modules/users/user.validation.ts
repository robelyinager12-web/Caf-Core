import { z } from 'zod';

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']).optional(),
  isActive: z.boolean().optional(),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;