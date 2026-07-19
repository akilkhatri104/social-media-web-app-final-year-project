import { Router } from 'express';
import { getExplore, searchDiscoverableContent } from '../controllers/discovery.controller.js';

const router = Router();

router.get('/', getExplore);
router.get('/search', searchDiscoverableContent);

export default router;
