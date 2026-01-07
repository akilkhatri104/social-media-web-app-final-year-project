import { APIError } from 'better-auth';
import type { Request, Response, NextFunction } from 'express';
import { stat } from 'node:fs';

export interface AppError extends Error {
  status?: number;
}

export class AppError extends Error {
  status?: number;
  statusCode?: number;

  constructor(message: string, status = 500) {
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
  const status =
    err instanceof APIError ? err.statusCode : (err.status as number);
  res.status(status || 500).json({
    message: err.message || 'Internal server errror',
    status: status || 500,
  });
};
