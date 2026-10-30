"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPaymentSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    method: zod_1.z.enum(['CASH', 'CARD', 'ONLINE']),
    amount: zod_1.z.coerce.number().positive('Amount must be greater than zero'),
});
exports.refundPaymentSchema = zod_1.z.object({
    reason: zod_1.z.string().min(2).max(255),
});
