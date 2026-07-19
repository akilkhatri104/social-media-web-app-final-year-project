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

export const errorHandler = (
  err: AppError | APIError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('ERROR :: ', err);

  if (err instanceof APIError) {
    console.log(err.message);
  }
  const status =
    err instanceof AppError
      ? err.status
      : err instanceof APIError
        ? err.statusCode
        : 500;

  const errorMsg = err.message;
  return res
    .status(status || 500)
    .json(new APIResponse(errorMsg || 'Internal server errror', status));
};
