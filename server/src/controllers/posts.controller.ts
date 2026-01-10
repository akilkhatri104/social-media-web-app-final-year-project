import type { Request, Response } from 'express';
import { auth } from '../lib/auth.ts';
import { AppError } from '../middlewares/errorHandler.ts';
import { post } from '../lib/db/schema.ts';
import { db } from '../lib/db/client.ts';
import { eq } from 'drizzle-orm';
import { APIResponse } from '../lib/apiResponse.ts';

export async function createPost(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError('User needs to be logged in to create a post', 401);
    }

    const { parentPostId, content, visibility } = req.body;

    if (!content) {
      throw new AppError('Post needs content', 400);
    }

    if (parentPostId) {
      const [parentPost] = await db
        .select()
        .from(post)
        .where(eq(parentPostId, post.id))
        .limit(1);

      if (!parentPost) {
        throw new AppError('Invalid parent post id provided', 400);
      }
    }

    const [createdPost] = await db
      .insert(post)
      .values({
        userId: req.session.user.id,
        parentPostId,
        content,
        visibility,
      })
      .returning({ postId: post.id });

    if (!createdPost || !createdPost.postId) {
      throw new AppError('Error while creating post', 500);
    }

    return res
      .status(200)
      .json(new APIResponse('Post created successfully!', 201, createdPost));
  } catch (error) {
    console.error('createPost :: ', error);
    throw error;
  }
}
