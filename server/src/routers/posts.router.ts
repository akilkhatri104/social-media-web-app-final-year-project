import { Router } from 'express';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import { createPost, getPostByID } from '../controllers/posts.controller.ts';

const router = Router();
const protectedRouter = Router();
const publicRouter = Router();

protectedRouter.use(verifyAuth);

//Protected Routes
protectedRouter.post('/', createPost);

//Public Routes
publicRouter.get('/:id', getPostByID);

router.use(publicRouter);
router.use(protectedRouter);
export default router;
