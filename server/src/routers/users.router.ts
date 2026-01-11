import { Router, type Request, type Response } from 'express';
import {
  signin,
  signup,
  me,
  logout,
  updateUser,
} from '../controllers/users.controller.js';
import { verifyAuth } from '../middlewares/verifyAuth.ts';

const router = Router();
const publicRouter = Router();
const protectedRouter = Router();

protectedRouter.use(verifyAuth);

publicRouter.post('/signin', signin);
publicRouter.post('/signup', signup);

protectedRouter.post('/logout', logout);
protectedRouter.get('/me', me);
protectedRouter.put('/', updateUser);

router.use(publicRouter);
router.use(protectedRouter);

export default router;
