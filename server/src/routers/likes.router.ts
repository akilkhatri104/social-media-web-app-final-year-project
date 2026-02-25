import { Router } from 'express';
import {
  getLikesCountByPostId,
  getLikeStatusByPostId,
  toggleLike,
} from '../controllers/likes.constoller.ts';
import { verifyAuth } from '../middlewares/verifyAuth.ts';

const router = Router();

router.post('/:postId', verifyAuth, toggleLike);
router.get('/likeStatus/:postId', verifyAuth, getLikeStatusByPostId);
router.get('/posts/:postId', getLikesCountByPostId);

export default router;
