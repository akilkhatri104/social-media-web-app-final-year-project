import { APIError } from 'better-auth';
import type { Request, Response, NextFunction } from 'express';
import { APIResponse } from '../lib/apiResponse.ts';

export interface AppError extends Error {
  status?: number;
}

export class AppError extends Error {
  status?: number;
  statusCode?: number;

  constructor(message: string = 'Internal server error', status: number = 500) {
    super(message);
    this.status = status;

    // Required when extending Error in TS
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

function sanitizeErrorMessage(err: unknown): string {
  if (err instanceof AppError) {
    return err.message;
  }

  if (err instanceof APIError) {
    return err.message || 'Request failed';
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('econnrefused') || msg.includes('connect')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    if (msg.includes('ETIMEOUT') || msg.includes('etimedout') || msg.includes('timeout')) {
      return 'Request timed out. Please try again later.';
    }
    if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('constraint')) {
      return 'A conflict occurred. Please try again.';
    }
    if (msg.includes('foreign key') || msg.includes('violates')) {
      return 'Operation failed due to a data constraint.';
    }
  }

  return 'An unexpected error occurred. Please try again later.';
}

function resolveStatus(err: unknown): number {
  if (err instanceof AppError) {
    return err.status || 500;
  }
  if (err instanceof APIError) {
    return err.statusCode || 500;
  }
  return 500;
}

export const errorHandler = (
  err: AppError | APIError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('ERROR :: ', err);

  const status = resolveStatus(err);
  const message = sanitizeErrorMessage(err);

  return res
    .status(status)
    .json(new APIResponse(message, status));
};
