"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenuItems = getMenuItems;
exports.getMenuItem = getMenuItem;
exports.postMenuItem = postMenuItem;
exports.patchMenuItem = patchMenuItem;
exports.removeMenuItem = removeMenuItem;
const menu_validation_1 = require("./menu.validation");
const menu_service_1 = require("./menu.service");
const apiResponse_1 = require("../../utils/apiResponse");
const audit_service_1 = require("../audit/audit.service");
function buildImageUrl(req) {
    if (!req.file)
        return undefined;
    return `/uploads/menu-images/${req.file.filename}`;
}
async function getMenuItems(req, res, next) {
    try {
        const query = menu_validation_1.listMenuItemsQuerySchema.parse(req.query);
        const result = await (0, menu_service_1.listMenuItems)(query);
        (0, apiResponse_1.sendSuccess)(res, 200, {
            message: 'Menu items retrieved successfully',
            data: result.items,
            meta: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getMenuItem(req, res, next) {
    try {
        const item = await (0, menu_service_1.getMenuItemById)(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Menu item retrieved successfully', data: item });
    }
    catch (error) {
        next(error);
    }
}
async function postMenuItem(req, res, next) {
    try {
        const input = menu_validation_1.createMenuItemSchema.parse(req.body);
        const imageUrl = buildImageUrl(req);
        const item = await (0, menu_service_1.createMenuItem)(input, imageUrl);
        await (0, audit_service_1.logAudit)({
            userId: req.user?.userId,
            action: 'MENU_ITEM_CREATED',
            entityType: 'MenuItem',
            entityId: item.id,
            metadata: { name: item.name, price: item.price },
        });
        (0, apiResponse_1.sendSuccess)(res, 201, { message: 'Menu item created successfully', data: item });
    }
    catch (error) {
        next(error);
    }
}
async function patchMenuItem(req, res, next) {
    try {
        const input = menu_validation_1.updateMenuItemSchema.parse(req.body);
        const imageUrl = buildImageUrl(req);
        const item = await (0, menu_service_1.updateMenuItem)(req.params.id, input, imageUrl);
        await (0, audit_service_1.logAudit)({
            userId: req.user?.userId,
            action: 'MENU_ITEM_UPDATED',
            entityType: 'MenuItem',
            entityId: item.id,
            metadata: { changes: input },
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Menu item updated successfully', data: item });
    }
    catch (error) {
        next(error);
    }
}
async function removeMenuItem(req, res, next) {
    try {
        await (0, menu_service_1.deleteMenuItem)(req.params.id);
        await (0, audit_service_1.logAudit)({
            userId: req.user?.userId,
            action: 'MENU_ITEM_DELETED',
            entityType: 'MenuItem',
            entityId: req.params.id,
        });
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Menu item deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
