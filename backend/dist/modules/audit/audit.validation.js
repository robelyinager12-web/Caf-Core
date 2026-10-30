"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogsQuerySchema = void 0;
const zod_1 = require("zod");
exports.listAuditLogsQuerySchema = zod_1.z.object({
    action: zod_1.z.string().max(100).optional(),
    entityType: zod_1.z.string().max(50).optional(),
    userId: zod_1.z.string().uuid().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => Math.min(val ? parseInt(val, 10) : 25, 100)),
});
