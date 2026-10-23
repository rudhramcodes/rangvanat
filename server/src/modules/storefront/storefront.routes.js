import { Router } from 'express';
import {
  subscribeNewsletter,
  submitEnquiry,
  getStoreStats,
} from './storefront.controller.js';

const router = Router();

router.post('/newsletter', subscribeNewsletter);
router.post('/enquiry', submitEnquiry);
router.get('/stats', getStoreStats);

export default router;
