import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
}

export class AppError extends Error {
  status?: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;

    // Required when extending Error in TS
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('ERROR :: ', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server errror',
    status: err.status || 500,
  });
};
