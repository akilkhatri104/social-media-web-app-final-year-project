import { Router } from 'express';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import {
  getFollowerCountByUserId,
  getFollowingCountByUserId,
  toggleFollow,
} from '../controllers/follows.controller.ts';

const router = Router();

router.post('/:followingId', verifyAuth, toggleFollow);
router.get('/followers/:userId', getFollowerCountByUserId);
router.get('/following/:userId', getFollowingCountByUserId);

export default router;
