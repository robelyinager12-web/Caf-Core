"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
let io = null;
function initSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.clientUrl,
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            next(new Error('Authentication token missing'));
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwt.accessSecret);
            socket.data.userId = decoded.userId;
            socket.data.role = decoded.role;
            next();
        }
        catch {
            next(new Error('Invalid or expired token'));
        }
    });
    io.on('connection', (socket) => {
        const role = socket.data.role;
        socket.join(`role:${role}`);
        logger_1.logger.info(`Socket connected: user ${socket.data.userId} (${role})`);
        socket.on('disconnect', () => {
            logger_1.logger.info(`Socket disconnected: user ${socket.data.userId}`);
        });
    });
    return io;
}
function getIO() {
    if (!io) {
        throw new Error('Socket.IO has not been initialized');
    }
    return io;
}
