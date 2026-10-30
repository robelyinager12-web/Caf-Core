"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient({
    log: env_1.env.isProduction
        ? [{ emit: 'event', level: 'error' }, { emit: 'event', level: 'warn' }]
        : [{ emit: 'event', level: 'query' }, { emit: 'event', level: 'error' }],
});
exports.prisma = prisma;
// Log slow queries (>200ms) even in development, to catch N+1s and missing
// indexes early rather than discovering them under production load.
prisma.$on('query', (e) => {
    if (e.duration > 200) {
        logger_1.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
    }
});
prisma.$on('error', (e) => {
    logger_1.logger.error('Prisma error', { error: e });
});
async function connectDatabase() {
    try {
        await prisma.$connect();
        logger_1.logger.info('Database connection established');
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to database', { error });
        process.exit(1);
    }
}
async function disconnectDatabase() {
    await prisma.$disconnect();
}
