"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersQuerySchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
exports.updateUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(150).optional(),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.listUsersQuerySchema = zod_1.z.object({
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']).optional(),
    isActive: zod_1.z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => (val === undefined ? undefined : val === 'true')),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20)),
});
