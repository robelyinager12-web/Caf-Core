"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const socket_1 = require("./config/socket");
const logger_1 = require("./utils/logger");
async function bootstrap() {
    await (0, db_1.connectDatabase)();
    const app = (0, app_1.createApp)();
    const httpServer = http_1.default.createServer(app);
    (0, socket_1.initSocket)(httpServer);
    httpServer.listen(env_1.env.port, () => {
        logger_1.logger.info(`Server running on port ${env_1.env.port} [${env_1.env.nodeEnv}]`);
    });
    const shutdown = async (signal) => {
        logger_1.logger.info(`${signal} received. Shutting down gracefully...`);
        httpServer.close(async () => {
            await (0, db_1.disconnectDatabase)();
            logger_1.logger.info('Shutdown complete');
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
bootstrap().catch((error) => {
    logger_1.logger.error('Failed to bootstrap server', { error });
    process.exit(1);
});
