import { Router } from 'express';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import {
  getFollowersByUserId,
  getFollowerCountByUserId,
  getFollowingCountByUserId,
  getFollowingByUserId,
  toggleFollow,
  getFollowStatusByUserId,
} from '../controllers/follows.controller.ts';

const router = Router();

router.post('/:followingId', verifyAuth, toggleFollow);
router.get('/status/:userId', verifyAuth, getFollowStatusByUserId);
router.get('/followers/:userId', getFollowersByUserId);
router.get('/following/:userId', getFollowingByUserId);
router.get('/followers/count/:userId', getFollowerCountByUserId);
router.get('/following/count/:userId', getFollowingCountByUserId);

export default router;
