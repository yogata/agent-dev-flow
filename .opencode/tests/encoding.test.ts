import { describe, it, expect } from 'vitest';
import { verifyEncoding } from '../src/verify/encoding.js';

describe('verifyEncoding', () => {
  it('returns no issues for identical text', () => {
    const text = 'Hello World';
    expect(verifyEncoding(text, text)).toEqual([]);
  });

  it('returns no issues for identical Japanese text', () => {
    const text = 'こんにちは世界';
    expect(verifyEncoding(text, text)).toEqual([]);
  });

  it('returns no issues for identical mixed text', () => {
    const text = 'Issue #42: バグ修正の実装';
    expect(verifyEncoding(text, text)).toEqual([]);
  });

  it('detects missing Japanese segment in readback', () => {
    const original = 'こんにちは世界';
    const readback = '????';
    const issues = verifyEncoding(original, readback);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(i => i.type === 'encoding')).toBe(true);
  });

  it('detects partially garbled Japanese text', () => {
    const original = 'バグ修正';
    const readback = 'バグ??';
    const issues = verifyEncoding(original, readback);
    expect(issues.some(i => i.type === 'encoding')).toBe(true);
  });

  it('passes when Japanese segments exist as substrings in readback', () => {
    const original = 'テスト';
    const readback = 'これはテストです';
    const issues = verifyEncoding(original, readback);
    expect(issues.filter(i => i.type === 'encoding')).toEqual([]);
  });

  it('detects control characters in readback (U+0001)', () => {
    const original = 'test';
    const readback = 'te\x01st';
    const issues = verifyEncoding(original, readback);
    expect(issues.some(i => i.type === 'control_char')).toBe(true);
  });

  it('detects control characters in readback (U+007F DEL)', () => {
    const original = 'test';
    const readback = 'te\x7Fst';
    const issues = verifyEncoding(original, readback);
    expect(issues.some(i => i.type === 'control_char')).toBe(true);
  });

  it('detects control characters in readback (U+0080)', () => {
    const original = 'test';
    const readback = 'te\x80st';
    const issues = verifyEncoding(original, readback);
    expect(issues.some(i => i.type === 'control_char')).toBe(true);
  });

  it('allows newlines (U+000A) without reporting control chars', () => {
    const original = 'line1\nline2';
    const readback = 'line1\nline2';
    const issues = verifyEncoding(original, readback);
    expect(issues.filter(i => i.type === 'control_char')).toEqual([]);
  });

  it('allows tabs (U+0009) without reporting control chars', () => {
    const original = 'col1\tcol2';
    const readback = 'col1\tcol2';
    const issues = verifyEncoding(original, readback);
    expect(issues.filter(i => i.type === 'control_char')).toEqual([]);
  });

  it('detects Unicode replacement character (U+FFFD) in readback', () => {
    const original = 'テスト';
    const readback = '\uFFFD\uFFFD\uFFFD';
    const issues = verifyEncoding(original, readback);
    expect(issues.some(i => i.type === 'replacement_char')).toBe(true);
  });

  it('does not report replacement char if original also has it at same position', () => {
    const text = '\uFFFD test';
    expect(verifyEncoding(text, text).filter(i => i.type === 'replacement_char')).toEqual([]);
  });

  it('handles empty strings', () => {
    expect(verifyEncoding('', '')).toEqual([]);
  });

  it('handles multiline Japanese text correctly', () => {
    const original = '## 概要\n\nこれはテストです。\n\n## 詳細\n\n詳細な説明。';
    const readback = '## 概要\n\nこれはテストです。\n\n## 詳細\n\n詳細な説明。';
    expect(verifyEncoding(original, readback)).toEqual([]);
  });

  it('reports multiple issue types simultaneously', () => {
    const original = 'テスト';
    const readback = 'テス\x01t\uFFFD';
    const issues = verifyEncoding(original, readback);
    expect(issues.some(i => i.type === 'control_char')).toBe(true);
    expect(issues.some(i => i.type === 'replacement_char')).toBe(true);
  });
});
