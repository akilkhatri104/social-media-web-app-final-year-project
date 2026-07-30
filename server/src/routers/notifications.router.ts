import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notifications.controller.ts';
import { verifyAuth } from '../middlewares/verifyAuth.ts';

const router = Router();

router.get('/', verifyAuth, getNotifications);
router.patch('/read/:id', verifyAuth, markAsRead);
router.patch('/read-all', verifyAuth, markAllAsRead);
router.delete('/:id', verifyAuth, deleteNotification);

export default router;
