import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getBestsellers,
  getProductBySlugOrId,
  getRelatedProducts,
} from './product.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestsellers);
router.get('/:identifier', getProductBySlugOrId);
router.get('/:identifier/related', getRelatedProducts);

export default router;
