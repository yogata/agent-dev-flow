export interface VerificationIssue {
  type: string;
  description: string;
  details?: string;
  line?: number;
  position?: number;
}

export interface RetryResult<T> {
  success: boolean;
  attempts: number;
  result?: T;
  lastError?: string;
}
