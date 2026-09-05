import type { Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler.ts';
import { db } from '../lib/db/client.ts';
import { notification } from '../lib/db/schema.ts';
import { APIResponse } from '../lib/apiResponse.ts';
import { eq, and, desc, count, isNull } from 'drizzle-orm';

export async function getNotifications(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to fetch notifications', 401);
    }

    const notifications = await db.query.notification.findMany({
      where: eq(notification.recipientId, req.session.user.id),
      orderBy: [desc(notification.createdAt)],
      limit: 100,
      with: {
        actor: {
          columns: {
            id: true,
            name: true,
            username: true,
            displayUsername: true,
            image: true,
          },
        },
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

export async function getUnreadNotificationCount(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to fetch notifications', 401);
    }

    const [result] = await db
      .select({ count: count() })
      .from(notification)
      .where(
        and(
          eq(notification.recipientId, req.session.user.id),
          isNull(notification.readAt),
        ),
      );

    return res.status(200).json(
      new APIResponse('Unread notifications fetched', 200, {
        unreadCount: result?.count ?? 0,
      }),
    );
  } catch (error) {
    console.error('getUnreadNotificationCount :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to mark notifications', 401);
    }

    const id = Number(req.params.id);
    if (!id) {
      throw new AppError('No or invalid notification id provided', 400);
    }

    const updated = await db
      .update(notification)
      .set({ readAt: new Date() })
<<<<<<< HEAD
      .where(
        and(
          eq(notification.id, id),
          eq(notification.recipientId, req.session.user.id),
        ),
      );
=======
      .where(and(eq(notification.id, id), eq(notification.recipientId, req.session.user.id)))
      .returning({ id: notification.id });
>>>>>>> upstream/main

    if (updated.length === 0) {
      throw new AppError('Notification not found', 404);
    }

    return res.status(200).json(new APIResponse('Notification marked read', 200));
  } catch (error) {
    console.error('markAsRead :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to mark notifications', 401);
    }

    const updated = await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(eq(notification.recipientId, req.session.user.id))
      .returning({ id: notification.id });

    return res.status(200).json(
      new APIResponse('All notifications marked read', 200, {
        count: updated.length,
      }),
    );
  } catch (error) {
    console.error('markAllAsRead :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function deleteNotification(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to delete notification', 401);
    }

    const id = Number(req.params.id);
    if (!id) {
      throw new AppError('No or invalid notification id provided', 400);
    }

    const deleted = await db.delete(notification).where(
      and(eq(notification.id, id), eq(notification.recipientId, req.session.user.id)),
    ).returning({ id: notification.id });
    if (deleted.length === 0) {
      throw new AppError('Notification not found', 404);
    }

    return res.status(200).json(new APIResponse('Notification deleted', 200));
  } catch (error) {
    console.error('deleteNotification :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
