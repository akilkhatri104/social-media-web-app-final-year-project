import { Router } from 'express';
import {
  getPostsForHashtag,
  getTrendingHashtags,
} from '../controllers/discovery.controller.js';

const router = Router();

router.get('/trending', getTrendingHashtags);
router.get('/:tag/posts', getPostsForHashtag);

export default router;
