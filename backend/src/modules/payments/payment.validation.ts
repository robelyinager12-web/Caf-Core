import { z } from 'zod';

export const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['CASH', 'CARD', 'ONLINE']),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
});

export const refundPaymentSchema = z.object({
  reason: z.string().min(2).max(255),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;