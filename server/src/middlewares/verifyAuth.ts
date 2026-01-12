import type { NextFunction, Response, Request } from 'express';
import { auth } from '../lib/auth.ts';
import type { Session, User } from 'better-auth';
import { AppError } from './errorHandler.ts';
import type { CloudinaryFile } from '../lib/cloudinary.ts';

declare module 'express-serve-static-core' {
  export interface Request {
    session?: { session: Session; user: User } | null;
    file?: Express.Multer.File;
    files?:
      | Express.Multer.File[]
      | { [fieldname: string]: Express.Multer.File[] }
      | CloudinaryFile[];
  }
}

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
    req.session = session;
    next();
  } catch (error) {
    console.error('verifyAuth :: ', error);
    throw error;
  }
}
