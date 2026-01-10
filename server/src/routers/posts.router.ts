import { Router } from 'express';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import {
  createPost,
  deletePostByID,
  getPostByID,
  getPostFromUser,
} from '../controllers/posts.controller.ts';

const router = Router();
const protectedRouter = Router();
const publicRouter = Router();

protectedRouter.use(verifyAuth);

//Protected Routes
protectedRouter.post('/', createPost);
protectedRouter.delete('/:id', deletePostByID);

//Public Routes
publicRouter.get('/:id', getPostByID);
publicRouter.get('/users/:id', getPostFromUser);

router.use(publicRouter);
router.use(protectedRouter);
export default router;
