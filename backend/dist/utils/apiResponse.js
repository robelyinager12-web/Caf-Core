"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, statusCode, { message = 'Success', data, meta }) {
    return res.status(statusCode).json({
        success: true,
        message,
        data: data ?? null,
        meta: meta ?? undefined,
    });
}
function sendError(res, statusCode, message, errors) {
    return res.status(statusCode).json({
        success: false,
        message,
        errors: errors ?? undefined,
    });
}
