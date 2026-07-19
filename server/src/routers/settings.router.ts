import { Router } from 'express';
import { verifyAuth } from '../middlewares/verifyAuth.ts';
import { noCache } from '../middlewares/noCache.ts';
import {
  getSessions,
  deleteSession,
  deleteOtherSessionsDirect,
  deleteAccount,
  changePassword,
} from '../controllers/settings.controller.ts';

const router = Router();

router.use(noCache, verifyAuth);

router.get('/sessions', getSessions);
router.delete('/sessions', deleteOtherSessionsDirect);
router.delete('/sessions/:id', deleteSession);
router.delete('/account', deleteAccount);
router.post('/change-password', changePassword);

export default router;
