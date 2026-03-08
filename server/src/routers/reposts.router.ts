import { Router } from 'express';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import {
  getRepostStatus,
  toggleRepost,
} from '../controllers/reposts.controller.ts';

const router = Router();

router.get('/status/:postId ', verifyAuth, getRepostStatus);
router.post('/:postId', verifyAuth, toggleRepost);

export default router;
