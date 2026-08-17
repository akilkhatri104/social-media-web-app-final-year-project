import { APIResponse } from '../../src/lib/apiResponse.js';

describe('APIResponse', () => {
  it('creates a success response with defaults', () => {
    const res = new APIResponse('ok');
    expect(res.message).toBe('ok');
    expect(res.status).toBe(200);
    expect(res.success).toBe(true);
    expect(res.data).toEqual({});
  });

  it('creates a success response with data', () => {
    const data = { id: 1, name: 'test' };
    const res = new APIResponse('created', 201, data);
    expect(res.message).toBe('created');
    expect(res.status).toBe(201);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(data);
  });

  it('creates an error response', () => {
    const res = new APIResponse('not found', 404);
    expect(res.message).toBe('not found');
    expect(res.status).toBe(404);
    expect(res.success).toBe(false);
  });

  it('creates a 500 response', () => {
    const res = new APIResponse('server error', 500);
    expect(res.success).toBe(false);
    expect(res.status).toBe(500);
  });

  it('treats 399 and below as success', () => {
    const res = new APIResponse('redirect', 302);
    expect(res.success).toBe(true);
  });

  it('treats 400 and above as failure', () => {
    const res = new APIResponse('bad request', 400);
    expect(res.success).toBe(false);
  });
});
