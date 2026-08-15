import type { Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler.ts';
import { db } from '../lib/db/client.ts';
import { like, post } from '../lib/db/schema.ts';
import { and, count, eq } from 'drizzle-orm';
import { APIResponse } from '../lib/apiResponse.ts';
import { createNotificationOnce } from '../lib/notifications.ts';

export async function toggleLike(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to like a post', 401);
    }

    const postId = Number(req.params?.postId);
    if (!postId) {
      throw new AppError('No or invalid post ID provided', 400);
    }

    const postExists = await db
      .select()
      .from(post)
      .where(eq(post.id, postId))
      .limit(1);

    if (!postExists || postExists.length === 0) {
      throw new AppError('No post found with given ID', 404);
    }

    const likeExists = await db
      .select()
      .from(like)
      .where(and(eq(like.postId, postId), eq(like.userId, req.session.user.id)))
      .limit(1);

    if (likeExists && likeExists.length === 1) {
      const likeDeleted = await db
        .delete(like)
        .where(
          and(eq(like.postId, postId), eq(like.userId, req.session.user.id)),
        );

      if (!likeDeleted || likeDeleted.rowCount === 0) {
        throw new AppError('Error while unliking post', 500);
      }

      return res
        .status(200)
        .json(new APIResponse('Unliked post successfully', 200));
    }

    const likeInserted = await db.insert(like).values({
      userId: req.session.user.id,
      postId,
    });

    if (!likeInserted || likeInserted.rowCount == 0) {
      throw new AppError('Error while liking the post', 500);
    }

    // create notification for the post owner (if not liking own post)
    try {
      const postOwner = await db.query.post.findFirst({
        where: eq(post.id, postId),
        columns: { userId: true },
      });

      if (postOwner) {
        await createNotificationOnce({
          recipientId: postOwner.userId,
          actorId: req.session.user.id,
          type: 'like',
          postId,
        });
      }
    } catch (e) {
      console.error('likes.controller: notification creation failed', e);
    }

    return res
      .status(201)
      .json(new APIResponse('Post liked successfully', 201));
  } catch (error) {
    console.error('toggleLike :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getLikesCountByPostId(req: Request, res: Response) {
  try {
    const postId = Number(req.params.postId);
    if (!postId) {
      throw new AppError('No or invalid post ID provided', 400);
    }
    const postExists = await db
      .select()
      .from(post)
      .where(eq(post.id, postId))
      .limit(1);

    if (!postExists || postExists.length == 0) {
      throw new AppError('Post with ID not found', 404);
    }

    const likes = await db
      .select({ count: count() })
      .from(like)
      .where(eq(like.postId, postId));

    return res.status(200).json(
      new APIResponse('Likes count fetched', 200, {
        count: likes[0]?.count,
      }),
    );
  } catch (error) {
    console.error('getLikesCountByPostId :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getLikedPostsFromUser(req: Request, res: Response) {
  try {
    if (!req.params || !req.params['id']) {
      throw new AppError('No user ID provided', 400);
    }
    const userId = req.params['id'];
    if (!userId || typeof userId !== 'string') {
      throw new AppError('Invalid user ID provided', 400);
    }
    const likedEntries = await db.query.like.findMany({
      where: eq(like.userId, userId),
      with: {
        post: {
          with: {
            likes: true,
            media: true,
            author: true,
            postHashtags: { with: { hashtag: true } },
            comments: {
              with: { media: true, likes: true, author: true, postHashtags: { with: { hashtag: true } } },
            },
          },
        },
      },
    });
    const likedPosts = likedEntries
      .filter(likeItem => likeItem.post)
      .map(({ post }) => ({
        ...post,
        likeCount: post.likes?.length ?? 0,
        comments: post.comments?.map((comment) => ({
          ...comment,
          likeCount: comment.likes?.length ?? 0,
        })) ?? [],
      }));
    return res
      .status(200)
      .json(new APIResponse('Liked posts fetched successfully', 200, likedPosts));
  } catch (error) {
    console.error('getLikedPostsFromUser :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getLikeStatusByPostId(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError(
        'User needs to be logged in to access their like status',
        401,
      );
    }

    const postId = Number(req.params.postId);
    if (!postId) {
      throw new AppError('No or invalid postID provided', 400);
    }

    const result = await db
      .select()
      .from(like)
      .where(and(eq(like.postId, postId), eq(like.userId, req.session.user.id)))
      .limit(1);

    if (result.length === 0) {
      return res.json(
        new APIResponse('User has not liked the post', 200, {
          likeStatus: false,
        }),
      );
    }
    return res.json(
      new APIResponse('User has liked the post', 200, {
        likeStatus: true,
      }),
    );
  } catch (error) {
    console.error('getLikeStatusByPostId :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
