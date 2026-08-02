import type { Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler.ts';
import { db } from '../lib/db/client.ts';
import { bookmark, follow, like, post, repost } from '../lib/db/schema.ts';
import { and, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { APIResponse } from '../lib/apiResponse.ts';
import { toPostDto } from '../lib/postDto.ts';
import { auth } from '../lib/auth.ts';

type ViewerFeedContext = {
  followedUserIds: Set<string>;
  interactedPostIds: Set<number>;
  interactedAuthorIds: Set<string>;
  interestedHashtags: Set<string>;
};

const FOR_YOU_CANDIDATE_LIMIT = 200;

function postWithFeedRelations() {
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
        parentPost: { with: { author: true } },
      },
    },
  } as const;
}

function addPostToViewerContext(
  context: ViewerFeedContext,
  targetPost?: {
    id: number;
    userId: string;
    postHashtags?: { hashtag?: { name: string } | null }[];
  } | null,
) {
  if (!targetPost) {
    return;
  }

  context.interactedPostIds.add(targetPost.id);
  context.interactedAuthorIds.add(targetPost.userId);

  for (const entry of targetPost.postHashtags ?? []) {
    if (entry.hashtag?.name) {
      context.interestedHashtags.add(entry.hashtag.name);
    }
  }
}

function canViewPostInForYou(
  targetPost: { userId: string; visibility: 'public' | 'followers' | null },
  viewerId: string | null,
  viewerContext: ViewerFeedContext | null,
) {
  if (targetPost.visibility !== 'followers') {
    return true;
  }

  if (!viewerId || !viewerContext) {
    return false;
  }

  return (
    targetPost.userId === viewerId ||
    viewerContext.followedUserIds.has(targetPost.userId)
  );
}

async function getViewerFeedContext(userId: string): Promise<ViewerFeedContext> {
  const context: ViewerFeedContext = {
    followedUserIds: new Set<string>(),
    interactedPostIds: new Set<number>(),
    interactedAuthorIds: new Set<string>(),
    interestedHashtags: new Set<string>(),
  };

  const [follows, likedPosts, bookmarkedPosts, repostedPosts, comments, ownPosts] =
    await Promise.all([
      db
        .select({ followingId: follow.followingId })
        .from(follow)
        .where(eq(follow.followerId, userId)),
      db.query.like.findMany({
        where: eq(like.userId, userId),
        with: {
          post: {
            with: { postHashtags: { with: { hashtag: true } } },
          },
        },
      }),
      db.query.bookmark.findMany({
        where: eq(bookmark.userId, userId),
        with: {
          post: {
            with: { postHashtags: { with: { hashtag: true } } },
          },
        },
      }),
      db.query.repost.findMany({
        where: eq(repost.userId, userId),
        with: {
          post: {
            with: { postHashtags: { with: { hashtag: true } } },
          },
        },
      }),
      db.query.post.findMany({
        where: and(eq(post.userId, userId), isNotNull(post.parentPostId)),
        with: {
          parentPost: {
            with: { postHashtags: { with: { hashtag: true } } },
          },
        },
      }),
      db.query.post.findMany({
        where: eq(post.userId, userId),
        with: { postHashtags: { with: { hashtag: true } } },
      }),
    ]);

  for (const item of follows) {
    context.followedUserIds.add(item.followingId);
  }

  for (const item of likedPosts) {
    addPostToViewerContext(context, item.post);
  }

  for (const item of bookmarkedPosts) {
    addPostToViewerContext(context, item.post);
  }

  for (const item of repostedPosts) {
    addPostToViewerContext(context, item.post);
  }

  for (const item of comments) {
    addPostToViewerContext(context, item.parentPost);
  }

  for (const item of ownPosts) {
    addPostToViewerContext(context, item);
  }

  return context;
}

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
      with: postWithFeedRelations(),
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
          with: postWithFeedRelations(),
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
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    req.session = session;

    const viewerContext = session
      ? await getViewerFeedContext(session.user.id)
      : null;
    const viewerId = session?.user.id ?? null;

    const candidatePosts = await db.query.post.findMany({
      where: isNull(post.parentPostId),
      with: postWithFeedRelations(),
      orderBy: desc(post.createdAt),
      limit: FOR_YOU_CANDIDATE_LIMIT,
    });

    const resultPosts = candidatePosts
      .filter((post) => canViewPostInForYou(post, viewerId, viewerContext))
      .map((post) => ({
        itemType: 'post' as const,
        createdAt: post.createdAt,
        post: toPostDto(post),
      }));

    const reposts = await db.query.repost.findMany({
      orderBy: desc(repost.createdAt),
      with: {
        user: true,
        post: {
          with: postWithFeedRelations(),
        },
      },
    });

    const resultReposts = reposts
      .filter((repost) =>
        canViewPostInForYou(repost.post, viewerId, viewerContext),
      )
      .map((repost) => ({
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
