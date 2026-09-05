import { jest } from '@jest/globals';
import { validateEnvOrExit, getEnv } from '../../src/lib/validateEnv.js';

describe('validateEnvOrExit', () => {
  const originalEnv = process.env;
  let mockExit: jest.SpiedFunction<typeof process.exit>;

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    }) as unknown as jest.SpiedFunction<typeof process.exit>;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    mockExit.mockRestore();
    jest.restoreAllMocks();
  });

  it('does not exit when all required vars are set', () => {
    const requiredVars = [
      'FRONTEND_URL', 'BACKEND_URL', 'DATABASE_URL',
      'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
      'SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD',
      'SMTP_FROM_NAME', 'SMTP_FROM_EMAIL',
    ];
    for (const key of requiredVars) {
      process.env[key] = 'test-value';
    }

    expect(() => validateEnvOrExit()).not.toThrow();
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('exits when a required var is missing', () => {
    delete process.env.DATABASE_URL;
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.BACKEND_URL = 'http://localhost:8000';
    process.env.CLOUDINARY_CLOUD_NAME = 'test';
    process.env.CLOUDINARY_API_KEY = 'test';
    process.env.CLOUDINARY_API_SECRET = 'test';
    process.env.SMTP_HOST = 'test';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USERNAME = 'test';
    process.env.SMTP_PASSWORD = 'test';
    process.env.SMTP_FROM_NAME = 'test';
    process.env.SMTP_FROM_EMAIL = 'test@test.com';

    expect(() => validateEnvOrExit()).toThrow('process.exit called');
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});

describe('getEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns the value when env var exists', () => {
    process.env.TEST_VAR = 'hello';
    expect(getEnv('TEST_VAR')).toBe('hello');
  });

  it('throws when env var is missing', () => {
    delete process.env.MISSING_VAR;
    expect(() => getEnv('MISSING_VAR')).toThrow(
      'Environment variable $MISSING_VAR is required but missing.',
    );
  });

  it('throws when env var is empty string', () => {
    process.env.EMPTY_VAR = '';
    expect(() => getEnv('EMPTY_VAR')).toThrow(
      'Environment variable $EMPTY_VAR is required but missing.',
    );
  });
});
