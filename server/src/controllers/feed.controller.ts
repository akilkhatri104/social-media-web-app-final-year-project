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

    const posts = await db
      .select()
      .from(post)
      .where(inArray(post.userId, follows));
  } catch (error) {
    console.error('getFollowingFeed :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getSimpleForYouFeed(req: Request, res: Response) {
  try {
    const posts = await db.select().from(post).orderBy(desc(post.updatedAt));

    return res.status(200).json(new APIResponse('Posts fetched', 200, posts));
  } catch (error) {
    console.error('getSimpleForYouFeed :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
