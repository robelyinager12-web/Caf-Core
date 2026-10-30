"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.signup = signup;
exports.login = login;
exports.refresh = refresh;
exports.postChangePassword = postChangePassword;
const auth_validation_1 = require("./auth.validation");
const auth_service_1 = require("./auth.service");
const apiResponse_1 = require("../../utils/apiResponse");
const audit_service_1 = require("../audit/audit.service");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function register(req, res, next) {
    try {
        const input = auth_validation_1.registerSchema.parse(req.body);
        const user = await (0, auth_service_1.registerUser)(input);
        await (0, audit_service_1.logAudit)({
            userId: req.user?.userId ?? null,
            action: 'USER_REGISTERED',
            entityType: 'User',
            entityId: user.id,
            metadata: { createdEmail: user.email, createdRole: user.role },
        });
        (0, apiResponse_1.sendSuccess)(res, 201, { message: 'User registered successfully', data: user });
    }
    catch (error) {
        next(error);
    }
}
async function signup(req, res, next) {
    try {
        const input = auth_validation_1.publicSignupSchema.parse(req.body);
        const user = await (0, auth_service_1.publicSignup)(input);
        await (0, audit_service_1.logAudit)({
            userId: null,
            action: 'USER_SELF_SIGNUP',
            entityType: 'User',
            entityId: user.id,
            metadata: { email: user.email },
        });
        (0, apiResponse_1.sendSuccess)(res, 201, { message: 'Account created successfully', data: user });
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const input = auth_validation_1.loginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginUser)(input);
        await (0, audit_service_1.logAudit)({
            userId: result.user.id,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: result.user.id,
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Login successful', data: result });
    }
    catch (error) {
        next(error);
    }
}
async function refresh(req, res, next) {
    try {
        const { refreshToken } = auth_validation_1.refreshTokenSchema.parse(req.body);
        const result = await (0, auth_service_1.refreshAccessToken)(refreshToken);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Token refreshed', data: result });
    }
    catch (error) {
        next(error);
    }
}
async function postChangePassword(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const input = auth_validation_1.changePasswordSchema.parse(req.body);
        await (0, auth_service_1.changePassword)(req.user.userId, input);
        await (0, audit_service_1.logAudit)({
            userId: req.user.userId,
            action: 'PASSWORD_CHANGED',
            entityType: 'User',
            entityId: req.user.userId,
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
}
