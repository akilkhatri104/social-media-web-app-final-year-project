import { and, eq } from 'drizzle-orm';
import { AppError } from '../middlewares/errorHandler.ts';
import type { Request, Response } from 'express';
import { post, repost } from '../lib/db/schema.ts';
import { db } from '../lib/db/client.ts';
import { APIResponse } from '../lib/apiResponse.ts';
import { createNotificationOnce } from '../lib/notifications.ts';

export async function toggleRepost(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to toggle reposts.', 401);
    }

    const postId = Number(req.params.postId);
    if (!postId) {
      throw new AppError('No postId provided', 400);
    }

    const repostPost = await db.query.post.findFirst({
      where: eq(post.id, postId),
    });
    if (!repostPost) {
      throw new AppError('No post found with given postId', 404);
    }

    const repostExists = await db.query.repost.findFirst({
      where: and(
        eq(repost.postId, postId),
        eq(repost.userId, req.session.user.id),
      ),
    });

    //repost exists, delete it
    if (repostExists) {
      const deleteRes = await db
        .delete(repost)
        .where(eq(repost.id, repostExists.id));

      if (!deleteRes || deleteRes.rowCount == 0) {
        throw new AppError('Error while deleting repost', 500);
      }

      return res.status(200).json(
        new APIResponse('Repost deleted successfully', 200, {
          reposted: false,
        }),
      );
    }

    const repostCreated = await db.insert(repost).values({
      userId: req.session.user.id,
      postId,
    });

    if (!repostCreated) {
      throw new AppError('Error while creating repost', 500);
    }

    // notify original post owner
    try {
      const postOwner = await db.query.post.findFirst({
        where: eq(post.id, postId),
        columns: { userId: true },
      });

      if (postOwner) {
        await createNotificationOnce({
          recipientId: postOwner.userId,
          actorId: req.session.user.id,
          type: 'repost',
          postId,
        });
      }
    } catch (e) {
      console.error('reposts.controller: notification creation failed', e);
    }

    return res
      .status(201)
      .json(
        new APIResponse('Repost created successfully', 201, { reposted: true }),
      );
  } catch (error) {
    console.error('toggleRepost :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getRepostStatus(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError(
        'User needs to be logged in to get repost status.',
        401,
      );
    }

    const postId = Number(req.params.postId);
    if (!postId) {
      throw new AppError('No postId provided', 400);
    }

    const repostPost = await db.query.post.findFirst({
      where: eq(post.id, postId),
    });
    if (!repostPost) {
      throw new AppError('No post found with given postId', 404);
    }

    const repostExists = await db.query.repost.findFirst({
      where: and(
        eq(repost.postId, postId),
        eq(repost.userId, req.session.user.id),
      ),
    });

    const qoutedRepostExists = await db.query.post.findFirst({
      where: and(
        eq(post.userId, req.session.user.id),
        eq(post.quotedPostId, postId),
      ),
    });

    return res.status(200).json(
      new APIResponse('Repost status fetched successfully', 201, {
        reposted: !!repostExists || !!qoutedRepostExists,
      }),
    );
  } catch (error) {
    console.error('getRepostStatus :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
