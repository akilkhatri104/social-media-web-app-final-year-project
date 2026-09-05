import { jest } from '@jest/globals';
import { authLimiter, feedLimiter, discoveryLimiter } from '../../src/middlewares/rateLimiter.js';
import type { Request, Response, NextFunction } from 'express';

function createMockReq() {
  return {
    ip: '127.0.0.1',
    headers: {},
    get: jest.fn().mockReturnValue('127.0.0.1'),
  } as unknown as Request;
}

function createMockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    getHeader: jest.fn().mockReturnValue(undefined),
    writableEnded: false,
  } as unknown as Response;
  return res;
}

describe('rate limiters', () => {
  it('authLimiter is defined and is a function', () => {
    expect(authLimiter).toBeDefined();
    expect(typeof authLimiter).toBe('function');
  });

  it('feedLimiter is defined and is a function', () => {
    expect(feedLimiter).toBeDefined();
    expect(typeof feedLimiter).toBe('function');
  });

  it('discoveryLimiter is defined and is a function', () => {
    expect(discoveryLimiter).toBeDefined();
    expect(typeof discoveryLimiter).toBe('function');
  });

  it('authLimiter allows first request through', (done) => {
    const req = createMockReq();
    const res = createMockRes();
    const next: NextFunction = jest.fn(() => {
      expect(next).toHaveBeenCalled();
      done();
    });

    authLimiter(req, res, next);
  });

  it('feedLimiter allows first request through', (done) => {
    const req = createMockReq();
    const res = createMockRes();
    const next: NextFunction = jest.fn(() => {
      expect(next).toHaveBeenCalled();
      done();
    });

    feedLimiter(req, res, next);
  });

  it('discoveryLimiter allows first request through', (done) => {
    const req = createMockReq();
    const res = createMockRes();
    const next: NextFunction = jest.fn(() => {
      expect(next).toHaveBeenCalled();
      done();
    });

    discoveryLimiter(req, res, next);
  });
});
