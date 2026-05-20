import { describe, it, expect } from 'vitest';

const STATUS_VALUES = {
  notStarted: '☐ 未着手',
  inProgress: '🔄 進行中',
  completed: '✅ 完了',
  noAction: '❌ 対処不要',
} as const;

const NEW_FORMAT_STATUS_TO_IN_PROGRESS = (childIssue: number) =>
  new RegExp(`(\\| \\d+-\\d+ \\| #${childIssue} \\| )☐ 未着手 (\\|)`);

const NEW_FORMAT_STATUS_TO_COMPLETE = (childIssue: number, prNumber: number, prUrl: string) =>
  new RegExp(`(\\| \\d+-\\d+ \\| #${childIssue} \\| )(☐ 未着手|🔄 進行中) (\\|)`);

const OLD_FORMAT_STATUS_TO_IN_PROGRESS = (childIssue: number) =>
  new RegExp(`(\\| \\d+ \\| #${childIssue} \\| [^|]* \\| )☐ 未着手 (\\|)`);

const OLD_FORMAT_STATUS_TO_COMPLETE = (childIssue: number) =>
  new RegExp(`(\\| \\d+ \\| #${childIssue} \\| [^|]* \\| )(☐ 未着手|🔄 進行中) (\\|)`);

const PARENT_PATTERN = /Parent:\s*#?(\d+)/;

const IDEMPOTENCY_NEW_FORMAT = (childIssue: number) =>
  new RegExp(`\\| \\d+-\\d+ \\| #${childIssue} \\| ✅ 完了`);

const IDEMPOTENCY_OLD_FORMAT = (childIssue: number) =>
  new RegExp(`\\| \\d+ \\| #${childIssue} \\|[^|]*\\| ✅ 完了`);

describe('Epic Status Tracker - Status Values', () => {
  it('defines all four status values', () => {
    expect(STATUS_VALUES.notStarted).toBe('☐ 未着手');
    expect(STATUS_VALUES.inProgress).toBe('🔄 進行中');
    expect(STATUS_VALUES.completed).toBe('✅ 完了');
    expect(STATUS_VALUES.noAction).toBe('❌ 対処不要');
  });
});

describe('Epic Status Tracker - Parent Detection', () => {
  it('detects Parent: #N pattern', () => {
    const body = 'Some text\nParent: #42\nMore text';
    const match = body.match(PARENT_PATTERN);
    expect(match).not.toBeNull();
    expect(match![1]).toBe('42');
  });

  it('detects Parent: N pattern (no hash)', () => {
    const body = 'Parent: 42';
    const match = body.match(PARENT_PATTERN);
    expect(match).not.toBeNull();
    expect(match![1]).toBe('42');
  });

  it('returns null when no Parent pattern exists', () => {
    const body = 'No parent here';
    expect(body.match(PARENT_PATTERN)).toBeNull();
  });

  it('handles whitespace in Parent pattern', () => {
    const body = 'Parent:  #42';
    const match = body.match(PARENT_PATTERN);
    expect(match).not.toBeNull();
    expect(match![1]).toBe('42');
  });
});

describe('Epic Status Tracker - New 4-column format: to in-progress', () => {
  const epicBody = `| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #42 | ☐ 未着手 | 子Issueの概要 |
| 1-2 | #43 | 🔄 進行中 | 子Issueの概要 |`;

  it('matches 未着手 row for child issue #42', () => {
    const regex = NEW_FORMAT_STATUS_TO_IN_PROGRESS(42);
    expect(regex.test(epicBody)).toBe(true);
  });

  it('does not match 進行中 row as 未着手', () => {
    const regex = NEW_FORMAT_STATUS_TO_IN_PROGRESS(43);
    expect(regex.test(epicBody)).toBe(false);
  });

  it('produces correct replacement text', () => {
    const regex = NEW_FORMAT_STATUS_TO_IN_PROGRESS(42);
    const match = regex.exec(epicBody);
    expect(match).not.toBeNull();
    const replaced = epicBody.replace(regex, '$1🔄 進行中 $2');
    expect(replaced).toContain('| 1-1 | #42 | 🔄 進行中 |');
    expect(replaced).not.toContain('☐ 未着手');
  });
});

describe('Epic Status Tracker - New 4-column format: to complete', () => {
  const epicBody = `| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #42 | 🔄 進行中 | 子Issueの概要 |`;

  it('matches 進行中 row for completion', () => {
    const regex = NEW_FORMAT_STATUS_TO_COMPLETE(42, 100, 'https://github.com/test/pull/100');
    expect(regex.test(epicBody)).toBe(true);
  });

  it('produces correct completion replacement', () => {
    const regex = NEW_FORMAT_STATUS_TO_COMPLETE(42, 100, 'https://github.com/test/pull/100');
    const replaced = epicBody.replace(regex, '$1✅ 完了 ([PR#100](https://github.com/test/pull/100)) $3');
    expect(replaced).toContain('✅ 完了 ([PR#100](https://github.com/test/pull/100))');
  });
});

describe('Epic Status Tracker - Old 4-column format: to in-progress', () => {
  const epicBody = `| # | Issue | タイトル | ステータス |
|---|-------|----------|-----------|
| 1 | #42 | 子Issueの概要 | ☐ 未着手 |
| 2 | #43 | 子Issueの概要 | 🔄 進行中 |`;

  it('matches 未着手 row for old format', () => {
    const regex = OLD_FORMAT_STATUS_TO_IN_PROGRESS(42);
    expect(regex.test(epicBody)).toBe(true);
  });

  it('produces correct replacement for old format', () => {
    const regex = OLD_FORMAT_STATUS_TO_IN_PROGRESS(42);
    const replaced = epicBody.replace(regex, '$1🔄 進行中 $2');
    expect(replaced).toContain('| 1 | #42 | 子Issueの概要 | 🔄 進行中 |');
  });
});

describe('Epic Status Tracker - Old 4-column format: to complete', () => {
  const epicBody = `| # | Issue | タイトル | ステータス |
|---|-------|----------|-----------|
| 1 | #42 | 子Issueの概要 | 🔄 進行中 |`;

  it('produces correct completion replacement for old format', () => {
    const regex = OLD_FORMAT_STATUS_TO_COMPLETE(42);
    const replaced = epicBody.replace(regex, '$1✅ 完了 ([PR#99](https://github.com/test/pull/99)) $3');
    expect(replaced).toContain('✅ 完了 ([PR#99](https://github.com/test/pull/99))');
  });
});

describe('Epic Status Tracker - Idempotency', () => {
  const completedEpicNew = `| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #42 | ✅ 完了 ([PR#100](https://...)) | 子Issueの概要 |`;

  const completedEpicOld = `| # | Issue | タイトル | ステータス |
|---|-------|----------|-----------|
| 1 | #42 | 子Issueの概要 | ✅ 完了 ([PR#99](https://github.com/...)) |`;

  it('detects already completed status in new format', () => {
    const regex = IDEMPOTENCY_NEW_FORMAT(42);
    expect(regex.test(completedEpicNew)).toBe(true);
  });

  it('detects already completed status in old format', () => {
    const regex = IDEMPOTENCY_OLD_FORMAT(42);
    expect(regex.test(completedEpicOld)).toBe(true);
  });

  it('does not falsely detect 未着手 as completed', () => {
    const epicBody = `| 1-1 | #42 | ☐ 未着手 | content |`;
    expect(IDEMPOTENCY_NEW_FORMAT(42).test(epicBody)).toBe(false);
  });

  it('detects ❌ 対処不要 should not match completion check', () => {
    const epicBody = `| 1-1 | #42 | ❌ 対処不要 | content |`;
    expect(IDEMPOTENCY_NEW_FORMAT(42).test(epicBody)).toBe(false);
  });
});

describe('Epic Status Tracker - Full workflow simulation', () => {
  it('simulates full lifecycle: 未着手 → 進行中 → 完了', () => {
    let epicBody = `| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #42 | ☐ 未着手 | テストIssue |`;

    const toInProgress = NEW_FORMAT_STATUS_TO_IN_PROGRESS(42);
    epicBody = epicBody.replace(toInProgress, '$1🔄 進行中 $2');
    expect(epicBody).toContain('🔄 進行中');

    const toComplete = NEW_FORMAT_STATUS_TO_COMPLETE(42, 100, 'https://github.com/test/pull/100');
    epicBody = epicBody.replace(toComplete, '$1✅ 完了 ([PR#100](https://github.com/test/pull/100)) $3');
    expect(epicBody).toContain('✅ 完了 ([PR#100](https://github.com/test/pull/100))');
  });

  it('handles multiple child issues independently', () => {
    let epicBody = `| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #42 | ☐ 未着手 | Issue A |
| 1-2 | #43 | ☐ 未着手 | Issue B |`;

    const regex42 = NEW_FORMAT_STATUS_TO_IN_PROGRESS(42);
    epicBody = epicBody.replace(regex42, '$1🔄 進行中 $2');

    expect(epicBody).toContain('| 1-1 | #42 | 🔄 進行中 |');
    expect(epicBody).toContain('| 1-2 | #43 | ☐ 未着手 |');
  });
});
