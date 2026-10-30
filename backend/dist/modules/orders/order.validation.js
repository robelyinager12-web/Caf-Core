"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrdersQuerySchema = exports.updateOrderStatusSchema = exports.createOrderSchema = exports.orderItemSchema = void 0;
const zod_1 = require("zod");
exports.orderItemSchema = zod_1.z.object({
    menuItemId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive('Quantity must be at least 1').max(50, 'Quantity per item cannot exceed 50'),
});
exports.createOrderSchema = zod_1.z.object({
    orderType: zod_1.z.enum(['DINE_IN', 'TAKEAWAY']),
    tableOrToken: zod_1.z.string().max(20).optional(),
    items: zod_1.z
        .array(exports.orderItemSchema)
        .min(1, 'Order must contain at least one item')
        .max(50, 'Order cannot contain more than 50 distinct line items'),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
});
exports.listOrdersQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
    orderType: zod_1.z.enum(['DINE_IN', 'TAKEAWAY']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => Math.min(val ? parseInt(val, 10) : 20, 100)),
});
