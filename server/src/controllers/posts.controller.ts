import type { Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler.ts';
import { media, post, like } from '../lib/db/schema.ts';
import { db } from '../lib/db/client.ts';
import { count, eq, inArray, sql, type InferSelectModel } from 'drizzle-orm';
import { APIResponse } from '../lib/apiResponse.ts';
import {
  deleteFromCloudinary,
  generateThumbnail,
  uploadToCloudinary,
} from '../lib/cloudinary.ts';

export async function createPost(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError('User needs to be logged in to create a post', 401);
    }

    if (!req.session.user.emailVerified) {
      throw new AppError(
        'User needs to verify their email to create a post',
        401,
      );
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

    // handle media
    if (Array.isArray(req.files) && req.files.length > 0) {
      const uploads = req.files.map((file) => uploadToCloudinary(file.buffer));

      const uploadResults = await Promise.all(uploads);

      const queries = uploadResults.map((res) =>
        db.insert(media).values({
          url: res.secure_url,
          thumbnailUrl: generateThumbnail(res.public_id, res.resource_type),
          type: res.resource_type,
          postId: createdPost.postId,
        }),
      );

      const insertResults = await Promise.all(queries);
    }
    return res
      .status(200)
      .json(new APIResponse('Post created successfully!', 201, createdPost));
  } catch (error) {
    console.error('createPost :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}

export async function getPostCommentsLikeCountMediaByPostID(id: number) {
  const result = await db.query.post.findFirst({
    where: eq(post.id, id),
    with: {
      media: true,
      likes: true,
      comments: {
        with: {
          media: true,
          likes: true,
        },
      },
    },
  });

  if (!result) return null;

  return {
    ...result,
    likeCount: result.likes.length,
    comments: result.comments.map((comment) => ({
      ...comment,
      likeCount: comment.likes.length,
    })),
  };
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

    const result = await getPostCommentsLikeCountMediaByPostID(id);

    return res
      .status(200)
      .json(new APIResponse('Post fetched successfully', 200, result));
  } catch (error) {
    console.error('getPostByID :: ', error);
    throw error;
  }
}

export async function getPostFromUser(req: Request, res: Response) {
  try {
    if (!req.params || !req.params['id']) {
      throw new AppError('No user ID provided', 400);
    }

    const id = req.params['id'];
    const fetchedPosts = await db
      .select()
      .from(post)
      .where(eq(post.userId, id));

    return res
      .status(200)
      .json(new APIResponse('Posts fetched successfully', 200, fetchedPosts));
  } catch (error) {
    console.error('getPostFromUser :: ', error);
    throw error;
  }
}

export async function deletePostByID(req: Request, res: Response) {
  try {
    if (!req.session) {
      throw new AppError('User not logged in', 401);
    }
    if (!req.params || !req.params['id']) {
      throw new AppError('No post ID provided', 400);
    }

    const id = Number(req.params['id']);
    if (!id) {
      throw new AppError('Invalid post ID provided', 400);
    }

    console.log('deletePostByID :: ', 'Trying to delete post with ID', id);

    const [fetchedPost] = await db
      .select()
      .from(post)
      .where(eq(post.id, id))
      .limit(1);

    if (!fetchedPost) {
      throw new AppError('No post found with provided ID', 404);
    }

    console.log('deletePostByID :: ', 'Fetched post with ID', id);

    if (fetchedPost.userId !== req.session.user.id) {
      throw new AppError(
        'Post must belong to the logged in user to delete',
        401,
      );
    }

    console.log('deletePostByID :: ', 'Logged in user ID matches post user ID');

    const allPostMediaUrls = await db.execute<{
      url: string;
      type: 'auto' | 'image' | 'video' | 'raw' | undefined;
    }>(sql`
   WITH RECURSIVE post_tree AS (
    SELECT id FROM post WHERE id = ${fetchedPost.id}
    UNION ALL
    SELECT p.id
    FROM post p
    JOIN post_tree pt ON p.parent_post_id = pt.id
  )
  SELECT m.url,m.type
  FROM media m
  JOIN post_tree pt ON m.post_id = pt.id
`);

    console.log('deletePostByID :: ', 'Fetched all post media URLs');

    if (allPostMediaUrls.rows.length > 0) {
      const deletes = allPostMediaUrls.rows.map((media) =>
        deleteFromCloudinary(media.url, media.type),
      );

      const deleteResults = await Promise.all(deletes);

      if (!deleteResults) {
        throw new AppError(
          'Error while deleting post media (images/videos)',
          500,
        );
      }
    }

    const deletedPosts = await db
      .delete(post)
      .where(eq(post.id, fetchedPost.id))
      .returning({ deletedId: post.id });

    if (!deletedPosts.length) {
      throw new AppError('Error while deleting post(s)', 500);
    }

    return res
      .status(200)
      .json(
        new APIResponse(
          'Post (and its replies) deleted successfully',
          200,
          deletedPosts,
        ),
      );
  } catch (error) {
    console.error('deletePostById :: ', error);
    throw new AppError();
  }
}
