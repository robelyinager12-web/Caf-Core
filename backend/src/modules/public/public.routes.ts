import { Router } from 'express';
import { getPublicMenu } from './public.controller';
import { publicOrderRateLimiter } from '../../middlewares/rateLimiter';
import { postGuestOrder } from '../orders/order.controller';

const router = Router();

router.get('/menu', getPublicMenu);
router.post('/orders', publicOrderRateLimiter, postGuestOrder);

export default router;
