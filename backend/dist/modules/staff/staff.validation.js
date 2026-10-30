"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShiftsQuerySchema = exports.clockInSchema = void 0;
const zod_1 = require("zod");
exports.clockInSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().optional(), // Admin/Manager can clock in on behalf of staff; omitted = self
});
exports.listShiftsQuerySchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    activeOnly: zod_1.z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => val === 'true'),
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => Math.min(val ? parseInt(val, 10) : 20, 100)),
});
