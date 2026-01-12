import { Router, type Request, type Response } from 'express';
import {
  signin,
  signup,
  me,
  logout,
  updateUser,
} from '../controllers/users.controller.js';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import { upload } from '../lib/multer.ts';

const router = Router();
const publicRouter = Router();
const protectedRouter = Router();

protectedRouter.use(verifyAuth);

publicRouter.post('/signin', signin);
publicRouter.post('/signup', upload.single('image'), signup);

protectedRouter.post('/logout', logout);
protectedRouter.get('/me', me);
protectedRouter.put('/', upload.single('image'), updateUser);

router.use(publicRouter);
router.use(protectedRouter);

export default router;
