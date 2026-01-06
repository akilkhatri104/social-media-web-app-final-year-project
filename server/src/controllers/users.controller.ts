import { APIError } from 'better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { NextFunction, Request, Response } from 'express';

export async function me(req: Request, res: Response) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    throw new AppError('User not logged in', 400);
  }

  return res.json(session);
}

export async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Email and Password is required', {});
    }
    const response = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });

    return response;
  } catch (error) {
    if (error instanceof APIError) {
      console.error(error.message, error.status);
    }
    throw error;
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, name, image } = req.body;
    if (!email || !password || !name) {
      throw new Error('Email, Password and Name are required');
    }
    const response = await auth.api.signUpEmail({
      body: { email, password, name, image },
      asResponse: true,
    });

    return response;
  } catch (error) {
    if (error instanceof APIError) {
      console.error(error.message, error.status);
    } else if (error instanceof Error) {
      console.error(error.message);
    }
    throw error;
  }
}
