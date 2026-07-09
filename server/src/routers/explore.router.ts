import { Router } from 'express';
import { getExplore } from '../controllers/discovery.controller.js';

const router = Router();

router.get('/', getExplore);

export default router;
