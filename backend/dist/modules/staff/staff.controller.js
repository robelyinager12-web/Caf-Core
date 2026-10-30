"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postClockIn = postClockIn;
exports.postClockOut = postClockOut;
exports.getShifts = getShifts;
exports.getActiveStaff = getActiveStaff;
const staff_validation_1 = require("./staff.validation");
const staff_service_1 = require("./staff.service");
const apiResponse_1 = require("../../utils/apiResponse");
const audit_service_1 = require("../audit/audit.service");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function postClockIn(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const input = staff_validation_1.clockInSchema.parse(req.body);
        const targetUserId = input.userId ?? req.user.userId;
        if (input.userId && input.userId !== req.user.userId) {
            if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
                throw new errorHandler_1.AppError('You do not have permission to clock in another user', 403);
            }
        }
        const shift = await (0, staff_service_1.clockIn)(targetUserId);
        await (0, audit_service_1.logAudit)({
            userId: req.user.userId,
            action: 'STAFF_CLOCKED_IN',
            entityType: 'StaffShift',
            entityId: shift.id,
            metadata: { targetUserId },
        });
        (0, apiResponse_1.sendSuccess)(res, 201, { message: 'Clocked in successfully', data: shift });
    }
    catch (error) {
        next(error);
    }
}
async function postClockOut(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const targetUserId = req.body.userId ?? req.user.userId;
        if (req.body.userId && req.body.userId !== req.user.userId) {
            if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
                throw new errorHandler_1.AppError('You do not have permission to clock out another user', 403);
            }
        }
        const shift = await (0, staff_service_1.clockOut)(targetUserId);
        await (0, audit_service_1.logAudit)({
            userId: req.user.userId,
            action: 'STAFF_CLOCKED_OUT',
            entityType: 'StaffShift',
            entityId: shift.id,
            metadata: { targetUserId },
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Clocked out successfully', data: shift });
    }
    catch (error) {
        next(error);
    }
}
async function getShifts(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const query = staff_validation_1.listShiftsQuerySchema.parse(req.query);
        const result = await (0, staff_service_1.listShifts)(query, req.user.userId, req.user.role);
        (0, apiResponse_1.sendSuccess)(res, 200, {
            message: 'Shifts retrieved successfully',
            data: result.shifts,
            meta: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getActiveStaff(_req, res, next) {
    try {
        const active = await (0, staff_service_1.getCurrentlyActiveStaff)();
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Active staff retrieved successfully', data: active });
    }
    catch (error) {
        next(error);
    }
}
