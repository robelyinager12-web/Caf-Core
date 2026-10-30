"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const errorHandler_1 = require("../../middlewares/errorHandler");
function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errorHandler_1.AppError('Authentication token missing', 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        // Explicitly pinning the accepted algorithm closes a known JWT library
        // class of vulnerability where a token crafted with alg: "none" or a
        // mismatched algorithm could otherwise be accepted depending on library
        // version/config. jsonwebtoken defends against this by default, but
        // pinning it here removes any doubt and any risk from a future
        // dependency version change silently loosening that default.
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwt.accessSecret, { algorithms: ['HS256'] });
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    }
    catch {
        throw new errorHandler_1.AppError('Invalid or expired token', 401);
    }
}
function authorize(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            throw new errorHandler_1.AppError('Authentication required', 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new errorHandler_1.AppError('You do not have permission to perform this action', 403);
        }
        next();
    };
}
