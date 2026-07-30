import type { Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler.ts';
import { db } from '../lib/db/client.ts';
import { notification } from '../lib/db/schema.ts';
import { APIResponse } from '../lib/apiResponse.ts';
import { eq, and, desc } from 'drizzle-orm';

export async function getNotifications(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError('User needs to be logged in to fetch notifications', 401);
    }

    const notifications = await db.query.notification.findMany({
      where: eq(notification.recipientId, req.session.user.id),
      orderBy: [desc(notification.createdAt)],
      limit: 100,
      with: {
        actor: true,
        post: true,
      },
    });

    return res
      .status(200)
      .json(new APIResponse('Notifications fetched', 200, { notifications }));
  } catch (error) {
    console.error('getNotifications :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError('User needs to be logged in to mark notifications', 401);
    }

    const id = Number(req.params.id);
    if (!id) {
      throw new AppError('No or invalid notification id provided', 400);
    }

    const updated = await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(eq(notification.id, id))
      .where(eq(notification.recipientId, req.session.user.id));

    if (!updated) {
      throw new AppError('Error while marking notification read', 500);
    }

    return res.status(200).json(new APIResponse('Notification marked read', 200));
  } catch (error) {
    console.error('markAsRead :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError('User needs to be logged in to mark notifications', 401);
    }

    const updated = await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(eq(notification.recipientId, req.session.user.id));

    if (!updated) {
      throw new AppError('Error while marking notifications read', 500);
    }

    return res.status(200).json(new APIResponse('All notifications marked read', 200));
  } catch (error) {
    console.error('markAllAsRead :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function deleteNotification(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError('User needs to be logged in to delete notification', 401);
    }

    const id = Number(req.params.id);
    if (!id) {
      throw new AppError('No or invalid notification id provided', 400);
    }

    const deleted = await db.delete(notification).where(
      and(eq(notification.id, id), eq(notification.recipientId, req.session.user.id)),
    );
    if (!deleted) {
      throw new AppError('Error while deleting notification', 500);
    }

    return res.status(200).json(new APIResponse('Notification deleted', 200));
  } catch (error) {
    console.error('deleteNotification :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
