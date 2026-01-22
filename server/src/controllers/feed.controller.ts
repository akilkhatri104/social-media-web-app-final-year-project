import type { Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler.ts';
import { db } from '../lib/db/client.ts';
import { follow, post } from '../lib/db/schema.ts';
import { desc, eq, inArray } from 'drizzle-orm';
import { APIResponse } from '../lib/apiResponse.ts';

export async function getFollowingFeed(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError('User needs to be logged in access Following Feed');
    }

    const follows = db
      .select({ id: follow.followingId })
      .from(follow)
      .where(eq(follow.followerId, req.session.user.id));

    const fetchedPosts = await db.query.post.findMany({
      where: inArray(post.userId, follows),
      with: {
        likes: true,
        media: true,
        comments: {
          with: { media: true, likes: true },
          orderBy: desc(post.updatedAt),
        },
      },
      orderBy: desc(post.updatedAt),
    });

    const resultPosts = fetchedPosts.map((post) => ({
      ...post,
      likeCount: post.likes.length,
      comments: post.comments.map((comment) => ({
        ...comment,
        likeCount: comment.likes.length,
      })),
    }));

    return res
      .status(200)
      .json(
        new APIResponse(
          'Following feed fetched successfully',
          200,
          resultPosts,
        ),
      );
  } catch (error) {
    console.error('getFollowingFeed :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getSimpleForYouFeed(req: Request, res: Response) {
  try {
    const fetchedPosts = await db.query.post.findMany({
      with: {
        likes: true,
        media: true,
        comments: {
          with: { media: true, likes: true },
          orderBy: desc(post.updatedAt),
        },
      },
      orderBy: desc(post.updatedAt),
    });

    const resultPosts = fetchedPosts.map((post) => ({
      ...post,
      likeCount: post.likes.length,
      comments: post.comments.map((comment) => ({
        ...comment,
        likeCount: comment.likes.length,
      })),
    }));

    return res
      .status(200)
      .json(
        new APIResponse(
          'Simple For You feed fetched successfully',
          200,
          resultPosts,
        ),
      );
  } catch (error) {
    console.error('getSimpleForYouFeed :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
