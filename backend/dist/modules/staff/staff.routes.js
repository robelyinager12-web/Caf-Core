"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staff_controller_1 = require("./staff.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/clock-in', staff_controller_1.postClockIn);
router.post('/clock-out', staff_controller_1.postClockOut);
router.get('/active', (0, auth_middleware_1.authorize)('ADMIN', 'MANAGER'), staff_controller_1.getActiveStaff);
// Any authenticated user may view shifts — but only their own; Admin/Manager
// may additionally filter by any userId. The narrowing happens in the
// service layer below, not here, since it depends on comparing the query's
// userId against the caller's identity.
router.get('/shifts', staff_controller_1.getShifts);
exports.default = router;
