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
      returnHeaders: true,
      body: { email, password },
    });

    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) {
      console.log('COOKIES :: ', setCookies);
      res.setHeader('Set-Cookie', setCookies);
    }

    return res.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      console.error(error.message, error.status);
    }
    throw error;
  }
}

export async function signup(req: Request, res: Response) {
  console.log('BODY ::: ', req.body);
  if (!req.body) {
    console.error('Request body is missing');
    throw new AppError('Request body is missing', 400);
  }
  try {
    const { email, password, name, image } = req.body;
    if (!email || !password || !name) {
      console.error('Email, Password and Name are required');
      throw new Error('Email, Password and Name are required');
    }
    console.log('Request body is valid');
    const response = await auth.api.signUpEmail({
      returnHeaders: true,
      body: { email, password, name, image },
    });

    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) {
      console.log('COOKIES :: ', setCookies);
      res.setHeader('Set-Cookie', setCookies);
    }

    console.log('Response from sign up email:', response);
    return res.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      console.error('Error from sign up email:', error.message, error.status);
    } else if (error instanceof Error) {
      console.error('Error from sign up email:', error.message);
    }
    throw error;
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const response = await auth.api.signOut({
      headers: req.header,
      returnHeaders: true,
    });
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) {
      console.log('COOKIES :: ', setCookies);
      res.setHeader('Set-Cookie', setCookies);
    }
    return res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    if (error instanceof APIError) {
      console.error('Error from sign up email:', error.message, error.status);
    } else if (error instanceof Error) {
      console.error('Error from sign up email:', error.message);
    }
    throw error;
  }
}
