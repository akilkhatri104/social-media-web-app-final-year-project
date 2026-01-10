import type { Request, Response } from 'express';
import { request, response } from 'express';
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

export async function getPostByID(req: Request, res: Response) {
  try {
    if (!req.params || !req.params['id']) {
      throw new AppError('No post ID provided', 400);
    }

    const id = Number(req.params['id']);
    if (!id) {
      throw new AppError('Invalid post ID provided', 400);
    }
    const [fetchedPost] = await db
      .select()
      .from(post)
      .where(eq(post.id, id))
      .limit(1);

    if (!fetchedPost) {
      throw new AppError('No post found with provided ID', 404);
    }
    req;
    return res
      .status(200)
      .json(new APIResponse('Post fetched successfully', 200, fetchedPost));
  } catch (error) {
    console.error('getPostByID :: ', error);
    throw error;
  }
}
