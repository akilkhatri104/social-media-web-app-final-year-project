import { Router } from 'express';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import { createPost } from '../controllers/post.controller.ts';

const router = Router();
const protectedRouter = Router();
const publicRouter = Router();

protectedRouter.use(verifyAuth);

protectedRouter.post('/', createPost);

router.use(publicRouter);
router.use(protectedRouter);
export default router;
