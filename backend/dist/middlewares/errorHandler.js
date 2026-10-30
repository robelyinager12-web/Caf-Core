"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const apiResponse_1 = require("../utils/apiResponse");
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    if (err instanceof zod_1.ZodError) {
        (0, apiResponse_1.sendError)(res, 422, 'Validation failed', err.flatten().fieldErrors);
        return;
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            (0, apiResponse_1.sendError)(res, 409, `A record with this ${err.meta?.target ?? 'value'} already exists`);
            return;
        }
        if (err.code === 'P2025') {
            (0, apiResponse_1.sendError)(res, 404, 'Record not found');
            return;
        }
    }
    if (err instanceof AppError) {
        (0, apiResponse_1.sendError)(res, err.statusCode, err.message);
        return;
    }
    logger_1.logger.error('Unhandled error', { error: err, path: req.path, method: req.method });
    (0, apiResponse_1.sendError)(res, 500, 'Internal server error');
}
