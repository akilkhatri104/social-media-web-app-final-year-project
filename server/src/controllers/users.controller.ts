import { APIError } from 'better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';
import { AppError } from '../middlewares/errorHandler.js';
import { type Request, type Response } from 'express';
import { APIResponse } from '../lib/apiResponse.ts';

export async function me(req: Request, res: Response) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    throw new AppError('User not logged in', 400);
  }

  return res.json(
    new APIResponse('User session fetched successfully', 200, session),
  );
}

export async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email and Password is required', 400);
    }
    const response = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email, password },
    });

    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) {
      res.setHeader('Set-Cookie', setCookies);
    }

    return res
      .status(200)
      .json(
        new APIResponse('User signed in successfully', 200, response.response),
      );
  } catch (error) {
    console.error('signin :: ', error);
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
      throw new AppError('Email, Password and Name are required', 400);
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
    return res
      .status(201)
      .json(
        new APIResponse('User signed up successfully', 201, response.response),
      );
  } catch (error) {
    console.error('signup :: ', error);
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
    return res
      .status(200)
      .json(new APIResponse('User logged out successfully', 200));
  } catch (error) {
    console.error('logout :: ', logout);
    throw error;
  }
}
