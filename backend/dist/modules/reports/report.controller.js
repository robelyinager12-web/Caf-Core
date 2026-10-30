"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesSummaryReport = getSalesSummaryReport;
exports.getTopItemsReport = getTopItemsReport;
exports.getInventoryUsage = getInventoryUsage;
exports.getStockAdjustmentAudit = getStockAdjustmentAudit;
const report_validation_1 = require("./report.validation");
const report_service_1 = require("./report.service");
const apiResponse_1 = require("../../utils/apiResponse");
async function getSalesSummaryReport(req, res, next) {
    try {
        const input = report_validation_1.dateRangeSchema.parse(req.query);
        const report = await (0, report_service_1.getSalesSummary)(input);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Sales summary retrieved successfully', data: report });
    }
    catch (error) {
        next(error);
    }
}
async function getTopItemsReport(req, res, next) {
    try {
        const query = report_validation_1.topItemsQuerySchema.parse(req.query);
        const report = await (0, report_service_1.getTopSellingItems)(query);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Top selling items retrieved successfully', data: report });
    }
    catch (error) {
        next(error);
    }
}
async function getInventoryUsage(req, res, next) {
    try {
        const input = report_validation_1.dateRangeSchema.parse(req.query);
        const report = await (0, report_service_1.getInventoryUsageReport)(input);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Inventory usage report retrieved successfully', data: report });
    }
    catch (error) {
        next(error);
    }
}
async function getStockAdjustmentAudit(req, res, next) {
    try {
        const input = report_validation_1.dateRangeSchema.parse(req.query);
        const report = await (0, report_service_1.getStockAdjustmentAuditReport)(input);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Stock adjustment report retrieved successfully', data: report });
    }
    catch (error) {
        next(error);
    }
}
