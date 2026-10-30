"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.refreshTokenSchema = exports.publicSignupSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name is required').max(150),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN']),
});
// Public self-signup — deliberately does NOT accept a role in the request
// body. Accepting a role field here would let anyone register themselves
// as ADMIN; the role is fixed to CASHIER server-side regardless of what a
// client sends.
exports.publicSignupSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name is required').max(150),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'New password must contain an uppercase letter')
        .regex(/[0-9]/, 'New password must contain a number'),
})
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
});
