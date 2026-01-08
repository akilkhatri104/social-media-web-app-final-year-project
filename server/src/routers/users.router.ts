import { Router, type Request, type Response } from 'express';
import { signin, signup, me, logout } from '../controllers/users.controller.js';

const router = Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/logout', logout);
router.get('/me', me);

export default router;
