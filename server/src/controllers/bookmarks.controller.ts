import { and, desc, eq } from 'drizzle-orm';
import { AppError } from '../middlewares/errorHandler.ts';
import type { Request, Response } from 'express';
import { bookmark, post } from '../lib/db/schema.ts';
import { db } from '../lib/db/client.ts';
import { APIResponse } from '../lib/apiResponse.ts';
import { toPostDto } from '../lib/postDto.ts';

export async function toggleBookmark(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError(
        'User needs to be logged in to toggle bookmarks.',
        401,
      );
    }

    const postId = Number(req.params.postId);
    if (isNaN(postId) || postId <= 0) {
      throw new AppError('Invalid postId provided', 400);
    }

    const targetPost = await db.query.post.findFirst({
      where: eq(post.id, postId),
    });
    if (!targetPost) {
      throw new AppError('No post found with given postId', 404);
    }

    const bookmarkExists = await db.query.bookmark.findFirst({
      where: and(
        eq(bookmark.postId, postId),
        eq(bookmark.userId, req.session.user.id),
      ),
    });

    // bookmark exists, remove it
    if (bookmarkExists) {
      const deleteRes = await db
        .delete(bookmark)
        .where(eq(bookmark.id, bookmarkExists.id));

      if (!deleteRes || deleteRes.rowCount == 0) {
        throw new AppError('Error while removing bookmark', 500);
      }

      return res.status(200).json(
        new APIResponse('Bookmark removed successfully', 200, {
          bookmarked: false,
        }),
      );
    }

    // create bookmark
    const bookmarkCreated = await db.insert(bookmark).values({
      userId: req.session.user.id,
      postId,
    });

    if (!bookmarkCreated) {
      throw new AppError('Error while creating bookmark', 500);
    }

    return res.status(201).json(
      new APIResponse('Post bookmarked successfully', 201, {
        bookmarked: true,
      }),
    );
  } catch (error) {
    console.error('toggleBookmark :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getBookmarkStatus(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError(
        'User needs to be logged in to get bookmark status.',
        401,
      );
    }

    const postId = Number(req.params.postId);
    if (isNaN(postId) || postId <= 0) {
      throw new AppError('Invalid postId provided', 400);
    }

    const bookmarkExists = await db.query.bookmark.findFirst({
      where: and(
        eq(bookmark.postId, postId),
        eq(bookmark.userId, req.session.user.id),
      ),
    });

    return res.status(200).json(
      new APIResponse('Bookmark status fetched successfully', 200, {
        bookmarked: !!bookmarkExists,
      }),
    );
  } catch (error) {
    console.error('getBookmarkStatus :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getMyBookmarks(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError(
        'User needs to be logged in to view bookmarks.',
        401,
      );
    }

    const bookmarks = await db.query.bookmark.findMany({
      where: eq(bookmark.userId, req.session.user.id),
      orderBy: desc(bookmark.createdAt),
      with: {
        post: {
          with: {
            author: true,
            likes: true,
            media: true,
            postHashtags: { with: { hashtag: true } },
            reposts: true,
            quotePosts: true,
            parentPost: { with: { author: true } },
            quotedPost: {
              with: {
                author: true,
                likes: true,
                media: true,
                postHashtags: { with: { hashtag: true } },
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

    const result = bookmarks.map((b) => toPostDto(b.post));

    return res
      .status(200)
      .json(new APIResponse('Bookmarks fetched successfully', 200, result));
  } catch (error) {
    console.error('getMyBookmarks :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
