import { Router, type Request, type Response } from 'express';
import {
  signin,
  signup,
  me,
  logout,
  updateUser,
  sendEmailVerificationOTP,
  verifyEmailVerificationOTP,
  sendForgetPasswordOTP,
  verifyForgetPasswordOTP,
  getUserByUsername,
  searchUsers,
  verifySigninOTP,
  verifySecurityChallenge,
} from '../controllers/users.controller.js';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import { noCache } from '../middlewares/noCache.ts';
import { authLimiter } from '../middlewares/rateLimiter.ts';
import { upload } from '../lib/multer.ts';

const router = Router();
const publicRouter = Router();
const protectedRouter = Router();

protectedRouter.use(noCache);
protectedRouter.use(verifyAuth);

<<<<<<< HEAD
publicRouter.post('/signin', signin);
publicRouter.post('/signin/verify-otp', verifySigninOTP);
publicRouter.post(
  '/signin/verify-security',
  verifySecurityChallenge,
);
publicRouter.post('/signup', upload.single('image'), signup);
publicRouter.post('/forget-password/send', sendForgetPasswordOTP);
publicRouter.post('/forget-password/verify', verifyForgetPasswordOTP);
=======
publicRouter.post('/signin', authLimiter, signin);
publicRouter.post('/signup', authLimiter, upload.single('image'), signup);
publicRouter.post('/forget-password/send', authLimiter, sendForgetPasswordOTP);
publicRouter.post('/forget-password/verify', authLimiter, verifyForgetPasswordOTP);
>>>>>>> upstream/main

protectedRouter.get('/search', searchUsers);
protectedRouter.get('/me', me);
protectedRouter.post('/logout', logout);
protectedRouter.put('/', upload.single('image'), updateUser);
protectedRouter.get('/verify-email', sendEmailVerificationOTP);
protectedRouter.post('/verify-email', verifyEmailVerificationOTP);

router.use(publicRouter);
router.use(protectedRouter);
router.get('/:username', getUserByUsername);

export default router;
