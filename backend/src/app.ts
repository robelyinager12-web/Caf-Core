import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { logger } from './utils/logger';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import categoryRoutes from './modules/categories/category.routes';
import menuRoutes from './modules/menu/menu.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import recipeRoutes from './modules/recipes/recipe.routes';
import notificationRoutes from './modules/notifications/notification.routes';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(globalRateLimiter);

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/recipes', recipeRoutes);
  app.use('/api/notifications', notificationRoutes);
  // Remaining module routes mounted here incrementally as each is built
  // app.use('/api/orders', orderRoutes);
  // ... etc

  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });

  app.use(errorHandler);

  logger.info('Express application configured');
  return app;
}