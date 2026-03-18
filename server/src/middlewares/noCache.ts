import type { NextFunction, Response, Request } from 'express';

export function noCache(req: Request, res: Response, next: NextFunction) {
  res.setHeader(
    'Cache-Control',
    'private, no-store, no-cache, max-age=0, must-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
}
