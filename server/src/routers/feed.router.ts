import { Router } from 'express';
import { getSimpleForYouFeed } from '../controllers/feed.controller.js';

const router = Router();

router.get('/simple-for-you', getSimpleForYouFeed);

export default router;
