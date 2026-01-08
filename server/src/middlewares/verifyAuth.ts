import type { NextFunction, Response, Request } from 'express';
import { auth } from '../lib/auth.ts';
import { APIError } from 'better-auth';
import { AppError } from './errorHandler.ts';

export async function verifyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      throw new AppError(
        'User needs to be logged in to access this resource',
        401,
      );
    }

    next();
  } catch (error) {
    console.error('verifyAuth :: ', error);
    throw error;
  }
}
