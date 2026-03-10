import { Router } from 'express';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import {
  getBookmarkStatus,
  getMyBookmarks,
  toggleBookmark,
} from '../controllers/bookmarks.controller.ts';

const router = Router();

router.get('/', verifyAuth, getMyBookmarks);
router.get('/status/:postId', verifyAuth, getBookmarkStatus);
router.post('/:postId', verifyAuth, toggleBookmark);

export default router;
