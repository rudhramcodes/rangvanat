import { Router } from 'express';
import { getCollections, getCollectionById } from './collection.controller.js';

const router = Router();

router.get('/', getCollections);
router.get('/:id', getCollectionById);

export default router;
