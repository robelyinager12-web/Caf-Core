import { Request, Response, NextFunction } from 'express';

/**
 * Applies a short-lived Cache-Control header to GET responses on endpoints
 * whose data doesn't need to be instantly fresh — menu listings and
 * categories change rarely compared to how often they're fetched (every
 * page load of New Order, Menu Management, Kitchen Display, etc.).
 * Real-time data (orders, kitchen queue, notifications) never uses this.
 */
export function cacheFor(seconds: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `private, max-age=${seconds}`);
    }
    next();
  };
}