import type { Request, Response } from 'express';
import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';
import { AppError } from '../middlewares/errorHandler.ts';
import { db } from '../lib/db/client.ts';
import { hashtag, post, postHashtag } from '../lib/db/schema.ts';
import { user } from '../lib/auth-schema.ts';
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

function normalizeSearchTerm(value: unknown) {
  if (typeof value !== 'string') {
    return { raw: '', normalized: '' };
  }

  const raw = value.trim();
  return { raw, normalized: raw.toLowerCase() };
}

function parseSearchLimit(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 5;
  }

  return Math.min(Math.floor(parsed), 20);
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

export async function searchDiscoverableContent(req: Request, res: Response) {
  try {
    const { raw: rawQuery, normalized: query } = normalizeSearchTerm(req.query.q);
    const limit = parseSearchLimit(req.query.limit);

    if (!query) {
      throw new AppError('Search query is required', 400);
    }

    const queryPattern = `%${query}%`;
    const prefixPattern = `${query}%`;

    const matchingHashtagNames = await db
      .select({ name: hashtag.name })
      .from(hashtag)
      .where(ilike(hashtag.name, queryPattern));

    const matchingHashtags = await db
      .select({ id: hashtag.id })
      .from(hashtag)
      .where(ilike(hashtag.name, queryPattern));

    const matchingHashtagIds = matchingHashtags.map((item) => item.id);
    const postFilters = [ilike(post.content, queryPattern)];

    if (matchingHashtagIds.length > 0) {
      postFilters.push(inArray(post.id, matchingHashtagIds));
    }

    const userResults = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        displayUsername: user.displayUsername,
        image: user.image,
        bio: user.bio,
      })
      .from(user)
      .where(
        or(
          ilike(user.name, queryPattern),
          ilike(user.username, queryPattern),
          ilike(user.displayUsername, queryPattern),
          ilike(user.bio, queryPattern),
        ),
      )
      .orderBy(
        sql<number>`case
          when ${user.username} = ${query} then 0
          when ${user.displayUsername} = ${query} then 0
          when ${user.name} = ${query} then 0
          when ${user.username} ilike ${prefixPattern} then 1
          when ${user.displayUsername} ilike ${prefixPattern} then 1
          when ${user.name} ilike ${prefixPattern} then 1
          else 2
        end`,
        asc(user.displayUsername),
      )
      .limit(limit);

    const postResults = await db.query.post.findMany({
      where: and(
        isNull(post.parentPostId),
        or(...postFilters),
      ),
      with: postWithDiscoveryRelations(),
      orderBy: desc(post.createdAt),
      limit,
    });

    const hashtagNames = new Set<string>(
      matchingHashtagNames.map((item) => item.name),
    );

    for (const postResult of postResults) {
      for (const tag of postResult.postHashtags
        ?.map((entry) => entry.hashtag?.name)
        .filter((name): name is string => Boolean(name)) ?? []) {
        hashtagNames.add(tag);
      }
    }

    const hashtagNameList = [...hashtagNames].slice(0, limit);

    const hashtagResults =
      hashtagNameList.length > 0
        ? await db
            .select({
              name: hashtag.name,
              postCount: count(postHashtag.postId),
            })
            .from(hashtag)
            .leftJoin(postHashtag, eq(postHashtag.hashtagId, hashtag.id))
            .where(inArray(hashtag.name, hashtagNameList))
            .groupBy(hashtag.id, hashtag.name)
            .orderBy(
              sql<number>`case
                when ${hashtag.name} = ${query} then 0
                when ${hashtag.name} ilike ${prefixPattern} then 1
                else 2
              end`,
              desc(count(postHashtag.postId)),
              asc(hashtag.name),
            )
        : [];

    return res.status(200).json(
      new APIResponse('Search results fetched successfully', 200, {
        query: rawQuery,
        users: userResults,
        hashtags: hashtagResults,
        posts: postResults.map((item) => toPostDto(item)),
      }),
    );
  } catch (error) {
    console.error('searchDiscoverableContent :: ', error);
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
