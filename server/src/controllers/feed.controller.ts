import type { Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler.ts';
import { db } from '../lib/db/client.ts';
import { follow, post, repost } from '../lib/db/schema.ts';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { APIResponse } from '../lib/apiResponse.ts';
import { toPostDto } from '../lib/postDto.ts';

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
      where: and(isNull(post.parentPostId), inArray(post.userId, follows)),
      with: {
        author: true,
        likes: true,
        media: true,
        reposts: true,
        quotePosts: true,
        parentPost: { with: { author: true } },
        quotedPost: {
          with: {
            author: true,
            likes: true,
            media: true,
            comments: true,
            reposts: true,
            quotePosts: true,
          },
        },
        comments: {
          with: {
            media: true,
            likes: true,
            author: true,
            parentPost: { with: { author: true } },
          },
        },
      },
      orderBy: desc(post.createdAt),
    });

    const resultPosts = fetchedPosts.map((post) => ({
      itemType: 'post' as const,
      createdAt: post.createdAt,
      post: toPostDto(post),
    }));

    const reposts = await db.query.repost.findMany({
      where: inArray(repost.userId, follows),
      orderBy: desc(repost.createdAt),
      with: {
        user: true,
        post: {
          with: {
            author: true,
            likes: true,
            media: true,
            reposts: true,
            quotePosts: true,
            parentPost: { with: { author: true } },
            quotedPost: {
              with: {
                author: true,
                likes: true,
                media: true,
                comments: true,
                reposts: true,
                quotePosts: true,
              },
            },
            comments: {
              with: {
                media: true,
                likes: true,
                author: true,
              },
            },
          },
        },
      },
    });

    const resultReposts = reposts.map((repost) => ({
      itemType: 'repost' as const,
      createdAt: repost.createdAt,
      repostedBy: repost.user,
      originalPost: toPostDto(repost.post),
    }));

    const result = [...resultPosts, ...resultReposts].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return res
      .status(200)
      .json(
        new APIResponse('Following feed fetched successfully', 200, result),
      );
  } catch (error) {
    console.error('getFollowingFeed :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getSimpleForYouFeed(req: Request, res: Response) {
  try {
    const fetchedPosts = await db.query.post.findMany({
      where: isNull(post.parentPostId),
      with: {
        author: true,
        likes: true,
        media: true,
        reposts: true,
        quotePosts: true,
        parentPost: { with: { author: true } },
        quotedPost: {
          with: {
            author: true,
            likes: true,
            media: true,
            comments: true,
            reposts: true,
            quotePosts: true,
          },
        },
        comments: {
          with: {
            media: true,
            likes: true,
            author: true,
            parentPost: { with: { author: true } },
          },
        },
      },
      orderBy: desc(post.createdAt),
    });

    const resultPosts = fetchedPosts.map((post) => ({
      itemType: 'post' as const,
      createdAt: post.createdAt,
      post: toPostDto(post),
    }));

    const reposts = await db.query.repost.findMany({
      orderBy: desc(repost.createdAt),
      with: {
        user: true,
        post: {
          with: {
            author: true,
            likes: true,
            media: true,
            reposts: true,
            quotePosts: true,
            parentPost: { with: { author: true } },
            quotedPost: {
              with: {
                author: true,
                likes: true,
                media: true,
                comments: true,
                reposts: true,
                quotePosts: true,
              },
            },
            comments: {
              with: {
                media: true,
                likes: true,
                author: true,
              },
            },
          },
        },
      },
    });

    const resultReposts = reposts.map((repost) => ({
      itemType: 'repost' as const,
      createdAt: repost.createdAt,
      repostedBy: repost.user,
      originalPost: toPostDto(repost.post),
    }));

    const result = [...resultPosts, ...resultReposts].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return res
      .status(200)
      .json(
        new APIResponse(
          'Simple For You feed fetched successfully',
          200,
          result,
        ),
      );
  } catch (error) {
    console.error('getSimpleForYouFeed :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
