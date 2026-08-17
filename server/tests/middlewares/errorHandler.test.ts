import { jest } from '@jest/globals';
import { AppError, errorHandler } from '../../src/middlewares/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';

function createMockReq() {
  return {} as Request;
}

function createMockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('AppError', () => {
  it('creates an error with message and status', () => {
    const err = new AppError('test error', 400);
    expect(err.message).toBe('test error');
    expect(err.status).toBe(400);
    expect(err).toBeInstanceOf(Error);
  });

  it('defaults to 500 status', () => {
    const err = new AppError();
    expect(err.status).toBe(500);
    expect(err.message).toBe('Internal server error');
  });
});

describe('errorHandler', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleSpy.mockClear();
  });

  it('returns AppError message and status', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();
    const err = new AppError('Custom error', 422);

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error',
        status: 422,
        success: false,
      }),
    );
  });

  it('sanitizes generic Error messages', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();
    const err = new Error('Some internal detail');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'An unexpected error occurred. Please try again later.',
        status: 500,
      }),
    );
  });

  it('sanitizes ECONNREFUSED errors', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();
    const err = new Error('connect ECONNREFUSED 127.0.0.1:5432');

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Service temporarily unavailable. Please try again later.',
      }),
    );
  });

  it('sanitizes timeout errors', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();
    const err = new Error('ETIMEOUT request timed out');

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Request timed out. Please try again later.',
      }),
    );
  });

  it('sanitizes duplicate/constraint errors', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();
    const err = new Error('duplicate key value violates unique constraint');

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'A conflict occurred. Please try again.',
      }),
    );
  });

  it('sanitizes foreign key errors (without constraint keyword)', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();
    const err = new Error('foreign key violation on table users');

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Operation failed due to a data constraint.',
      }),
    );
  });

  it('returns 500 for generic errors', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();
    const err = new Error('random error');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
