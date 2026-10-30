"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topItemsQuerySchema = exports.dateRangeSchema = void 0;
const zod_1 = require("zod");
exports.dateRangeSchema = zod_1.z.object({
    dateFrom: zod_1.z.string().datetime('dateFrom must be a valid ISO date'),
    dateTo: zod_1.z.string().datetime('dateTo must be a valid ISO date'),
});
exports.topItemsQuerySchema = exports.dateRangeSchema.extend({
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => Math.min(val ? parseInt(val, 10) : 10, 50)),
});
