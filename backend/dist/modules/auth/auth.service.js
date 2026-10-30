"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.publicSignup = publicSignup;
exports.loginUser = loginUser;
exports.refreshAccessToken = refreshAccessToken;
exports.changePassword = changePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../config/db");
const env_1 = require("../../config/env");
const errorHandler_1 = require("../../middlewares/errorHandler");
const SALT_ROUNDS = 12;
const DUMMY_HASH = '$2b$12$CwTycUXWue0Thq9StjUM0uJ8Rri8ByfSA0AhVvTAyOJb0dxfmDcXW';
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwt.accessSecret, {
        expiresIn: env_1.env.jwt.accessExpiresIn,
    });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwt.refreshSecret, {
        expiresIn: env_1.env.jwt.refreshExpiresIn,
    });
}
async function registerUser(input) {
    const existing = await db_1.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new errorHandler_1.AppError('A user with this email already exists', 409);
    }
    const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
    const user = await db_1.prisma.user.create({
        data: {
            fullName: input.fullName,
            email: input.email,
            passwordHash,
            role: input.role,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });
    return user;
}
/**
 * Public self-signup — unauthenticated, no invitation needed. Always
 * creates the account as CASHIER regardless of anything in the request;
 * the role is hardcoded here, not read from input, since PublicSignupInput
 * has no role field to begin with (defense in depth with the schema).
 */
async function publicSignup(input) {
    const existing = await db_1.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new errorHandler_1.AppError('A user with this email already exists', 409);
    }
    const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
    const user = await db_1.prisma.user.create({
        data: {
            fullName: input.fullName,
            email: input.email,
            passwordHash,
            role: 'CASHIER',
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });
    return user;
}
async function loginUser(input) {
    const user = await db_1.prisma.user.findUnique({ where: { email: input.email } });
    const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
    const passwordMatches = await bcrypt_1.default.compare(input.password, hashToCompare);
    if (!user || !user.isActive || !passwordMatches) {
        throw new errorHandler_1.AppError('Invalid email or password', 401);
    }
    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return {
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
        accessToken,
        refreshToken,
    };
}
async function refreshAccessToken(refreshToken) {
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.jwt.refreshSecret);
    }
    catch {
        throw new errorHandler_1.AppError('Invalid or expired refresh token', 401);
    }
    const user = await db_1.prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
        throw new errorHandler_1.AppError('User no longer active', 401);
    }
    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
    return { accessToken: newAccessToken };
}
async function changePassword(userId, input) {
    const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const currentPasswordMatches = await bcrypt_1.default.compare(input.currentPassword, user.passwordHash);
    if (!currentPasswordMatches) {
        throw new errorHandler_1.AppError('Current password is incorrect', 401);
    }
    const newPasswordHash = await bcrypt_1.default.hash(input.newPassword, SALT_ROUNDS);
    await db_1.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
    });
}
