import { Router } from 'express';
import {
  getLikesCountByPostId,
  toggleLike,
} from '../controllers/likes.constoller.ts';
import { verifyAuth } from '../middlewares/verifyAuth.ts';

const router = Router();

router.post('/:postId', verifyAuth, toggleLike);
router.get('/posts/:postId', getLikesCountByPostId);

export default router;
