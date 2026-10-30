"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middlewares/errorHandler");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const sanitizeInput_1 = require("./middlewares/sanitizeInput");
const logger_1 = require("./utils/logger");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const category_routes_1 = __importDefault(require("./modules/categories/category.routes"));
const menu_routes_1 = __importDefault(require("./modules/menu/menu.routes"));
const inventory_routes_1 = __importDefault(require("./modules/inventory/inventory.routes"));
const recipe_routes_1 = __importDefault(require("./modules/recipes/recipe.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const order_routes_1 = __importDefault(require("./modules/orders/order.routes"));
const payment_routes_1 = __importDefault(require("./modules/payments/payment.routes"));
const staff_routes_1 = __importDefault(require("./modules/staff/staff.routes"));
const report_routes_1 = __importDefault(require("./modules/reports/report.routes"));
const audit_routes_1 = __importDefault(require("./modules/audit/audit.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.set('trust proxy', 1);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'data:'],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", env_1.env.clientUrl],
            },
        },
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // required so
        // uploaded menu-item images can be embedded by the frontend origin
    }));
    app.use((0, compression_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.clientUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'], // explicit allow-list —
        // no PUT/OPTIONS-adjacent surprises; matches exactly what this API
        // actually exposes across every module built in Phase 6
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(sanitizeInput_1.sanitizeInput);
    app.use(rateLimiter_1.globalRateLimiter);
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads'), { maxAge: '7d' }));
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/users', user_routes_1.default);
    app.use('/api/categories', category_routes_1.default);
    app.use('/api/menu', menu_routes_1.default);
    app.use('/api/inventory', inventory_routes_1.default);
    app.use('/api/recipes', recipe_routes_1.default);
    app.use('/api/notifications', notification_routes_1.default);
    app.use('/api/orders', order_routes_1.default);
    app.use('/api/payments', payment_routes_1.default);
    app.use('/api/staff', staff_routes_1.default);
    app.use('/api/reports', report_routes_1.default);
    app.use('/api/audit', audit_routes_1.default);
    app.use((req, res) => {
        res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
    });
    app.use(errorHandler_1.errorHandler);
    logger_1.logger.info('Express application configured');
    return app;
}
