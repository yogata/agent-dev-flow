import type { RetryResult } from './types.js';

/**
 * Execute a function with retry logic and verification.
 *
 * @param fn - The operation to perform (e.g., write content)
 * @param verify - Verification function that returns true if the result is acceptable
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns RetryResult with success status, attempts, and optional result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  verify: (result: T) => boolean,
  maxRetries: number = 3,
): Promise<RetryResult<T>> {
  let attempts = 0;
  let lastResult: T | undefined;

  while (attempts <= maxRetries) {
    attempts++;

    try {
      lastResult = await fn();

      if (verify(lastResult)) {
        return { success: true, attempts, result: lastResult };
      }

      if (attempts > maxRetries) {
        return {
          success: false,
          attempts,
          result: lastResult,
          lastError: `Verification failed after ${attempts} attempts`,
        };
      }
    } catch (error) {
      if (attempts > maxRetries) {
        return {
          success: false,
          attempts,
          lastError: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  return {
    success: false,
    attempts,
    result: lastResult,
    lastError: `Max retries (${maxRetries}) exceeded`,
  };
}
