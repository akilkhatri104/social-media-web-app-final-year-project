import { eq, and, count, inArray } from 'drizzle-orm';
import { user } from '../lib/auth-schema.ts';
import { db } from '../lib/db/client.ts';
import { AppError } from '../middlewares/errorHandler.ts';
import type { Request, Response } from 'express';
import { follow } from '../lib/db/schema.ts';
import { APIResponse } from '../lib/apiResponse.ts';

export async function toggleFollow(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError('User needs to be logged in to follow user', 401);
    }

    const { followingId } = req.params;
    if (!followingId || typeof followingId !== 'string') {
      throw new AppError('user id not provided to follow', 400);
    }

    if (followingId === req.session.user.id) {
      throw new AppError('User cannot follow themselves', 400);
    }

    const userExists = await db
      .select()
      .from(user)
      .where(eq(user.id, followingId))
      .limit(1);

    if (!userExists || userExists.length == 0) {
      throw new AppError('User with given ID not found', 404);
    }

    const followExist = await db
      .select()
      .from(follow)
      .where(
        and(
          eq(follow.followingId, followingId),
          eq(follow.followerId, req.session.user.id),
        ),
      )
      .limit(1);

    if (followExist.length > 0) {
      const followDeleted = await db
        .delete(follow)
        .where(
          and(
            eq(follow.followingId, followingId),
            eq(follow.followerId, req.session.user.id),
          ),
        );

      if (!followDeleted) {
        throw new AppError('Error while unfollowing user', 500);
      }

      return res
        .status(200)
        .json(new APIResponse('User unfollowd', 200, { isFollowing: false }));
    }

    const followCreated = await db.insert(follow).values({
      followerId: req.session.user.id,
      followingId,
    });

    if (!followCreated) {
      throw new AppError('Error while following user', 500);
    }

    return res.status(201).json(
      new APIResponse('User followed successfully', 201, {
        isFollowing: true,
      }),
    );
  } catch (error) {
    console.error('toggleFollow :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getFollowerCountByUserId(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== 'string') {
      throw new AppError('No user ID provided', 400);
    }

    const userExists = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userExists) {
      throw new AppError('User with ID not found', 404);
    }

    const followers = await db
      .select({ count: count() })
      .from(follow)
      .where(eq(follow.followingId, userId));

    return res.status(200).json(
      new APIResponse('Follower count fetched', 200, {
        count: followers[0]?.count,
      }),
    );
  } catch (error) {
    console.error('getFollowerCountByUserId :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getFollowingCountByUserId(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== 'string') {
      throw new AppError('No user ID provided', 400);
    }

    const userExists = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userExists) {
      throw new AppError('User with ID not found', 404);
    }

    const following = await db
      .select({ count: count() })
      .from(follow)
      .where(eq(follow.followerId, userId));

    return res.status(200).json(
      new APIResponse('Following count fetched', 200, {
        count: following[0]?.count,
      }),
    );
  } catch (error) {
    console.error('getFollowingCountByUserId :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
export async function getFollowersByUserId(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== 'string') {
      throw new AppError('No user ID provided', 400);
    }

    const userExists = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userExists) {
      throw new AppError('User with ID not found', 404);
    }

    const followersIdObj = await db
      .select({ id: follow.followerId })
      .from(follow)
      .where(eq(follow.followingId, userId));

    const followerId = followersIdObj.map((item) => item.id);

    const followers = await db.query.user.findMany({
      where: inArray(user.id, followerId),
    });

    return res.status(200).json(
      new APIResponse('Followers fetched', 200, {
        followers,
        count: followers.length,
      }),
    );
  } catch (error) {
    console.error('getFollowersByUserId :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getFollowingByUserId(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== 'string') {
      throw new AppError('No user ID provided', 400);
    }

    const userExists = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userExists) {
      throw new AppError('User with ID not found', 404);
    }

    const followingIdObj = await db
      .select({ id: follow.followingId })
      .from(follow)
      .where(eq(follow.followerId, userId));

    const followingId = followingIdObj.map((item) => item.id);

    const following = await db.query.user.findMany({
      where: inArray(user.id, followingId),
    });

    return res.status(200).json(
      new APIResponse('Following fetched', 200, {
        following,
        count: following.length,
      }),
    );
  } catch (error) {
    console.error('getFollowingByUserId :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getFollowStatusByUserId(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError(
        'User needs to be logged in to check follow status',
        401,
      );
    }

    const { userId } = req.params;
    if (!userId) {
      throw new AppError('No or invalid userID provided', 400);
    }

    const userExists = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });
    if (!userExists) {
      throw new AppError('User with give userId not found', 404);
    }

    const followExists = await db.query.follow.findFirst({
      where: and(
        eq(follow.followerId, req.session.user.id),
        eq(follow.followingId, userId),
      ),
    });

    return res.status(200).json(
      new APIResponse('Follow status fetched', 200, {
        isFollowing: !!followExists,
      }),
    );
  } catch (error) {
    console.error('getFollowStatus :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
