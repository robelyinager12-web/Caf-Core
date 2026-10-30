"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIngredientsQuerySchema = exports.updateThresholdSchema = exports.adjustStockSchema = exports.createIngredientSchema = void 0;
const zod_1 = require("zod");
exports.createIngredientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150),
    unit: zod_1.z.string().min(1).max(20),
    initialQuantity: zod_1.z.coerce.number().min(0).optional().default(0),
    lowStockThreshold: zod_1.z.coerce.number().min(0).optional().default(10),
});
exports.adjustStockSchema = zod_1.z.object({
    quantityChange: zod_1.z.coerce
        .number()
        .refine((val) => val !== 0, 'Quantity change cannot be zero'),
    reason: zod_1.z.string().min(2).max(255),
});
exports.updateThresholdSchema = zod_1.z.object({
    lowStockThreshold: zod_1.z.coerce.number().min(0),
});
exports.listIngredientsQuerySchema = zod_1.z.object({
    lowStockOnly: zod_1.z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => val === 'true'),
    search: zod_1.z.string().max(150).optional(),
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => Math.min(val ? parseInt(val, 10) : 20, 100)),
});
