import type { Request, Response } from 'express';
import { and, count, desc, eq, inArray, isNull } from 'drizzle-orm';
import { AppError } from '../middlewares/errorHandler.ts';
import { db } from '../lib/db/client.ts';
import { hashtag, post, postHashtag } from '../lib/db/schema.ts';
import { APIResponse } from '../lib/apiResponse.ts';
import { toPostDto } from '../lib/postDto.ts';

function postWithDiscoveryRelations() {
  return {
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
        postHashtags: { with: { hashtag: true } },
        parentPost: { with: { author: true } },
      },
    },
  } as const;
}

export async function getExplore(req: Request, res: Response) {
  try {
    const trendingHashtags = await db
      .select({
        name: hashtag.name,
        postCount: count(postHashtag.postId),
      })
      .from(hashtag)
      .leftJoin(postHashtag, eq(postHashtag.hashtagId, hashtag.id))
      .groupBy(hashtag.id, hashtag.name)
      .orderBy(desc(count(postHashtag.postId)), desc(hashtag.updatedAt))
      .limit(10);

    const recentPosts = await db.query.post.findMany({
      where: isNull(post.parentPostId),
      with: postWithDiscoveryRelations(),
      orderBy: desc(post.createdAt),
      limit: 25,
    });

    const popularPosts = recentPosts
      .map((item) => {
        const dto = toPostDto(item);
        const ageHours = Math.max(
          0,
          (Date.now() - new Date(dto.createdAt).getTime()) / 3_600_000,
        );
        const recencyScore = Math.max(0, 72 - ageHours);
        const score =
          dto.likeCount * 2 +
          dto.commentCount * 3 +
          dto.repostCount * 2 +
          recencyScore;

        return { dto, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ dto }) => dto);

    return res.status(200).json(
      new APIResponse('Explore data fetched successfully', 200, {
        trendingHashtags,
        popularPosts,
      }),
    );
  } catch (error) {
    console.error('getExplore :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getTrendingHashtags(req: Request, res: Response) {
  try {
    const trendingHashtags = await db
      .select({
        name: hashtag.name,
        postCount: count(postHashtag.postId),
      })
      .from(hashtag)
      .leftJoin(postHashtag, eq(postHashtag.hashtagId, hashtag.id))
      .groupBy(hashtag.id, hashtag.name)
      .orderBy(desc(count(postHashtag.postId)), desc(hashtag.updatedAt))
      .limit(10);

    return res.status(200).json(
      new APIResponse('Trending hashtags fetched successfully', 200, trendingHashtags),
    );
  } catch (error) {
    console.error('getTrendingHashtags :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getPostsForHashtag(req: Request, res: Response) {
  try {
    const rawTag = req.params.tag;
    if (!rawTag || typeof rawTag !== 'string') {
      throw new AppError('No hashtag tag provided', 400);
    }

    const tag = rawTag.trim().toLowerCase();
    if (!tag) {
      throw new AppError('Invalid hashtag tag provided', 400);
    }

    const hashtagRecord = await db.query.hashtag.findFirst({
      where: eq(hashtag.name, tag),
    });

    if (!hashtagRecord) {
      return res.status(200).json(
        new APIResponse('Hashtag posts fetched successfully', 200, []),
      );
    }

    const tagLinks = await db
      .select({ postId: postHashtag.postId })
      .from(postHashtag)
      .where(eq(postHashtag.hashtagId, hashtagRecord.id));

    const postIds = [...new Set(tagLinks.map((link) => link.postId))];

    if (postIds.length === 0) {
      return res.status(200).json(
        new APIResponse('Hashtag posts fetched successfully', 200, []),
      );
    }

    const posts = await db.query.post.findMany({
      where: and(isNull(post.parentPostId), inArray(post.id, postIds)),
      with: postWithDiscoveryRelations(),
      orderBy: desc(post.createdAt),
    });

    return res.status(200).json(
      new APIResponse(
        'Hashtag posts fetched successfully',
        200,
        posts.map((item) => toPostDto(item)),
      ),
    );
  } catch (error) {
    console.error('getPostsForHashtag :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
