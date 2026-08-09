import { Router } from 'express';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import {
  createPost,
  deletePostByID,
  getPostByID,
  getPostFromUser,
  getCommentsFromUser,
} from '../controllers/posts.controller.ts';
import { upload } from '../lib/multer.ts';

const router = Router();
const protectedRouter = Router();
const publicRouter = Router();

protectedRouter.use(verifyAuth);

//Protected Routes
protectedRouter.post('/', upload.array('media', 10), createPost);
protectedRouter.delete('/:id', deletePostByID);

//Public Routes
publicRouter.get('/:id', getPostByID);
publicRouter.get('/users/:id', getPostFromUser);
publicRouter.get('/users/:id/comments', getCommentsFromUser);

router.use(publicRouter);
router.use(protectedRouter);
export default router;
