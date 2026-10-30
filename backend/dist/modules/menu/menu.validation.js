"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMenuItemsQuerySchema = exports.updateMenuItemSchema = exports.createMenuItemSchema = void 0;
const zod_1 = require("zod");
exports.createMenuItemSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid('Invalid category ID'),
    name: zod_1.z.string().min(2).max(150),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.coerce.number().positive('Price must be greater than zero'),
    isAvailable: zod_1.z.coerce.boolean().optional().default(true),
});
exports.updateMenuItemSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(2).max(150).optional(),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.coerce.number().positive().optional(),
    isAvailable: zod_1.z.coerce.boolean().optional(),
});
exports.listMenuItemsQuerySchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid().optional(),
    isAvailable: zod_1.z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => (val === undefined ? undefined : val === 'true')),
    search: zod_1.z.string().max(150).optional(),
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => Math.min(val ? parseInt(val, 10) : 20, 100)),
});
