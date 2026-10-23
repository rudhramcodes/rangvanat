import { Router } from 'express';
import { createOrder, getOrderByNumber, trackOrder } from './order.controller.js';

const router = Router();

router.post('/', createOrder);
router.get('/:orderNumber', getOrderByNumber);
router.post('/track', trackOrder);

export default router;
