"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = getAuditLogs;
exports.getAuditActions = getAuditActions;
const audit_validation_1 = require("./audit.validation");
const audit_service_1 = require("./audit.service");
const apiResponse_1 = require("../../utils/apiResponse");
async function getAuditLogs(req, res, next) {
    try {
        const query = audit_validation_1.listAuditLogsQuerySchema.parse(req.query);
        const result = await (0, audit_service_1.listAuditLogs)(query);
        (0, apiResponse_1.sendSuccess)(res, 200, {
            message: 'Audit logs retrieved successfully',
            data: result.logs,
            meta: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getAuditActions(_req, res, next) {
    try {
        const actions = await (0, audit_service_1.getDistinctActions)();
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Audit action types retrieved successfully', data: actions });
    }
    catch (error) {
        next(error);
    }
}
