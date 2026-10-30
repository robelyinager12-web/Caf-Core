"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_service_1 = require("./notification.service");
const apiResponse_1 = require("../../utils/apiResponse");
const auth_middleware_1 = require("../auth/auth.middleware");
const errorHandler_1 = require("../../middlewares/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const unreadOnly = req.query.unreadOnly === 'true';
        const notifications = await (0, notification_service_1.listNotifications)(req.user.role, unreadOnly);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Notifications retrieved successfully', data: notifications });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/read', async (req, res, next) => {
    try {
        const notification = await (0, notification_service_1.markNotificationRead)(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Notification marked as read', data: notification });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
