import { Router } from 'express';
import {
  getFollowingFeed,
  getSimpleForYouFeed,
} from '../controllers/feed.controller.js';
import { verifyAuth } from '../middlewares/verifyAuth.ts';

const router = Router();

router.get('/simple-for-you', getSimpleForYouFeed);
router.get('/following', verifyAuth, getFollowingFeed);

export default router;
