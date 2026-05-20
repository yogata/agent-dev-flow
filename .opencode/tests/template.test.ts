import { describe, it, expect } from 'vitest';
import { extractRequiredHeadings, verifyRequiredSections } from '../src/verify/template.js';

describe('extractRequiredHeadings', () => {
  it('extracts headings with 【必須】 marker on next line', () => {
    const template = `## 概要
<!-- 【必須】 -->
Content here

## 補足`;
    const headings = extractRequiredHeadings(template);
    expect(headings).toContain('## 概要');
    expect(headings).not.toContain('## 補足');
  });

  it('extracts headings using first non-empty line as anchor when no marker', () => {
    const template = `## 概要
Content here

## 補足
Other content`;
    const headings = extractRequiredHeadings(template);
    expect(headings).toContain('## 概要');
    expect(headings).toContain('## 補足');
  });

  it('returns empty array for empty template', () => {
    expect(extractRequiredHeadings('')).toEqual([]);
  });

  it('returns empty array for template with no headings', () => {
    expect(extractRequiredHeadings('Just plain text\nNo headings')).toEqual([]);
  });

  it('skips heading with no content after it', () => {
    const template = `## 概要`;
    const headings = extractRequiredHeadings(template);
    expect(headings).toEqual([]);
  });

  it('handles mixed marker and no-marker headings', () => {
    const template = `## 必須セクション
<!-- 【必須】 -->
Required content

## 任意セクション
Some content

## さらに必須
<!-- 【必須】 -->
More required`;
    const headings = extractRequiredHeadings(template);
    expect(headings).toContain('## 必須セクション');
    expect(headings).toContain('## 任意セクション');
    expect(headings).toContain('## さらに必須');
  });

  it('stops at next heading when looking for non-empty line', () => {
    const template = `## セクション1

## セクション2
Content`;
    const headings = extractRequiredHeadings(template);
    expect(headings).not.toContain('## セクション1');
    expect(headings).toContain('## セクション2');
  });

  it('handles h3 and other heading levels', () => {
    const template = `### サブセクション
<!-- 【必須】 -->
Content`;
    const headings = extractRequiredHeadings(template);
    expect(headings).toContain('### サブセクション');
  });
});

describe('verifyRequiredSections', () => {
  it('returns no issues when all required sections exist', () => {
    const content = `## 概要
Some content

## 詳細
More content`;
    const headings = ['## 概要', '## 詳細'];
    expect(verifyRequiredSections(content, headings)).toEqual([]);
  });

  it('detects missing required section', () => {
    const content = `## 概要
Some content`;
    const headings = ['## 概要', '## 詳細'];
    const issues = verifyRequiredSections(content, headings);
    expect(issues.length).toBe(1);
    expect(issues[0].type).toBe('missing_required_section');
    expect(issues[0].details).toContain('詳細');
  });

  it('detects multiple missing sections', () => {
    const content = 'No headings here';
    const headings = ['## 概要', '## 詳細', '## 結論'];
    const issues = verifyRequiredSections(content, headings);
    expect(issues.length).toBe(3);
  });

  it('returns no issues for empty required headings list', () => {
    expect(verifyRequiredSections('any content', [])).toEqual([]);
  });

  it('matches headings regardless of surrounding whitespace', () => {
    const content = '  ## 概要  \nContent';
    const headings = ['## 概要'];
    expect(verifyRequiredSections(content, headings)).toEqual([]);
  });

  it('handles section name matching without leading hashes', () => {
    const content = `## 概要
Content`;
    const headings = ['## 概要'];
    expect(verifyRequiredSections(content, headings)).toEqual([]);
  });
});
