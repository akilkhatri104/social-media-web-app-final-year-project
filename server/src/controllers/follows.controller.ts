import { eq, and, count } from 'drizzle-orm';
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
    if (!followingId) {
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

      return res.status(200).json(new APIResponse('User unfollowd', 200));
    }

    const followCreated = await db.insert(follow).values({
      followerId: req.session.user.id,
      followingId,
    });

    if (!followCreated) {
      throw new AppError('Error while following user', 500);
    }

    return res
      .status(201)
      .json(new APIResponse('User followed successfully', 201));
  } catch (error) {
    console.error('toggleFollow :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getFollowerCountByUserId(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new AppError('No user ID provided', 400);
    }
    const userExists = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userExists || userExists.length == 0) {
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
    if (!userId) {
      throw new AppError('No user ID provided', 400);
    }
    const userExists = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userExists || userExists.length == 0) {
      throw new AppError('User with ID not found', 404);
    }

    const followers = await db
      .select({ count: count() })
      .from(follow)
      .where(eq(follow.followerId, userId));

    return res.status(200).json(
      new APIResponse('Following count fetched', 200, {
        count: followers[0]?.count,
      }),
    );
  } catch (error) {
    console.error('getFollowingCountByUserId :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
