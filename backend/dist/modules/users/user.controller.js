"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.patchUser = patchUser;
exports.removeUser = removeUser;
const user_validation_1 = require("./user.validation");
const user_service_1 = require("./user.service");
const apiResponse_1 = require("../../utils/apiResponse");
const audit_service_1 = require("../audit/audit.service");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function getUsers(req, res, next) {
    try {
        const query = user_validation_1.listUsersQuerySchema.parse(req.query);
        const result = await (0, user_service_1.listUsers)(query);
        (0, apiResponse_1.sendSuccess)(res, 200, {
            message: 'Users retrieved successfully',
            data: result.users,
            meta: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getUser(req, res, next) {
    try {
        const user = await (0, user_service_1.getUserById)(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'User retrieved successfully', data: user });
    }
    catch (error) {
        next(error);
    }
}
async function patchUser(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const input = user_validation_1.updateUserSchema.parse(req.body);
        const updated = await (0, user_service_1.updateUser)(req.params.id, input, req.user.userId);
        await (0, audit_service_1.logAudit)({
            userId: req.user.userId,
            action: 'USER_UPDATED',
            entityType: 'User',
            entityId: updated.id,
            metadata: { changes: input },
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'User updated successfully', data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function removeUser(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const deactivated = await (0, user_service_1.deactivateUser)(req.params.id, req.user.userId);
        await (0, audit_service_1.logAudit)({
            userId: req.user.userId,
            action: 'USER_DEACTIVATED',
            entityType: 'User',
            entityId: deactivated.id,
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'User deactivated successfully', data: deactivated });
    }
    catch (error) {
        next(error);
    }
}
