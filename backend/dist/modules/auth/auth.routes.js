"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("./auth.middleware");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.post('/register', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MANAGER'), auth_controller_1.register);
// Public self-signup — no auth required. Shares the same strict rate
// limiter as /login to blunt automated mass-account-creation abuse, since
// this endpoint has no invitation gate at all.
router.post('/signup', rateLimiter_1.authRateLimiter, auth_controller_1.signup);
router.post('/login', rateLimiter_1.authRateLimiter, auth_controller_1.login);
router.post('/refresh', auth_controller_1.refresh);
router.post('/change-password', auth_middleware_1.authenticate, auth_controller_1.postChangePassword);
exports.default = router;
