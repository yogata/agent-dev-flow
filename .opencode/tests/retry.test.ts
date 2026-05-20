import { describe, it, expect } from 'vitest';
import { withRetry } from '../src/verify/retry.js';

describe('withRetry', () => {
  it('succeeds on first attempt', async () => {
    const result = await withRetry(
      () => Promise.resolve('ok'),
      (r) => r === 'ok',
    );
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.result).toBe('ok');
  });

  it('succeeds after verification failures', async () => {
    let callCount = 0;
    const result = await withRetry(
      () => {
        callCount++;
        return Promise.resolve(callCount >= 3 ? 'good' : 'bad');
      },
      (r) => r === 'good',
    );
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(3);
    expect(result.result).toBe('good');
  });

  it('fails after max retries exceeded', async () => {
    const result = await withRetry(
      () => Promise.resolve('always bad'),
      () => false,
      3,
    );
    expect(result.success).toBe(false);
    expect(result.attempts).toBeGreaterThan(3);
    expect(result.lastError).toBeDefined();
  });

  it('handles exceptions and retries', async () => {
    let callCount = 0;
    const result = await withRetry(
      () => {
        callCount++;
        if (callCount < 2) throw new Error('fail');
        return Promise.resolve('ok');
      },
      (r) => r === 'ok',
      3,
    );
    expect(result.success).toBe(true);
    expect(result.result).toBe('ok');
  });

  it('reports error message when all retries fail with exception', async () => {
    const result = await withRetry(
      () => Promise.reject(new Error('persistent error')),
      () => true,
      3,
    );
    expect(result.success).toBe(false);
    expect(result.lastError).toContain('persistent error');
  });

  it('respects custom maxRetries value', async () => {
    let callCount = 0;
    const result = await withRetry(
      () => {
        callCount++;
        return Promise.resolve('not ok');
      },
      () => false,
      1,
    );
    expect(result.success).toBe(false);
    expect(callCount).toBeGreaterThan(1);
  });

  it('returns result on verification success even after previous failures', async () => {
    let callCount = 0;
    const result = await withRetry(
      () => {
        callCount++;
        return Promise.resolve(callCount === 2 ? 'perfect' : 'imperfect');
      },
      (r) => r === 'perfect',
      3,
    );
    expect(result.success).toBe(true);
    expect(result.result).toBe('perfect');
    expect(result.attempts).toBe(2);
  });
});
