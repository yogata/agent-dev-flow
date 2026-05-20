import { describe, it, expect } from 'vitest';
import { verifyMarkdownStructure } from '../src/verify/markdown.js';

describe('verifyMarkdownStructure - Tables', () => {
  it('returns no issues for identical valid tables', () => {
    const table = '| # | Issue | Status |\n|---|-------|--------|\n| 1 | #42 | Done |';
    expect(verifyMarkdownStructure(table, table)).toEqual([]);
  });

  it('detects column count mismatch in table rows', () => {
    const original = '| # | Issue | Status |\n|---|-------|--------|\n| 1 | #42 | Done |';
    const readback = '| # | Issue | Status |\n|---|-------|--------|\n| 1 | #42 | Done | Extra |';
    const issues = verifyMarkdownStructure(original, readback);
    expect(issues.some(i => i.type === 'table_column_mismatch')).toBe(true);
  });

  it('detects missing table header from readback', () => {
    const original = '| # | Issue |\n|---|-------|\n| 1 | #42 |';
    const readback = 'No tables here';
    const issues = verifyMarkdownStructure(original, readback);
    expect(issues.some(i => i.type === 'table_missing')).toBe(true);
  });

  it('handles multiple tables correctly', () => {
    const original = '| A | B |\n|---|---|\n| 1 | 2 |\n\nText\n\n| C | D |\n|---|---|\n| 3 | 4 |';
    expect(verifyMarkdownStructure(original, original)).toEqual([]);
  });
});

describe('verifyMarkdownStructure - Checkboxes', () => {
  it('preserves unchecked checkboxes', () => {
    const text = '- [ ] Task 1\n- [ ] Task 2';
    expect(verifyMarkdownStructure(text, text)).toEqual([]);
  });

  it('preserves checked checkboxes', () => {
    const text = '- [x] Task 1\n- [x] Task 2';
    expect(verifyMarkdownStructure(text, text)).toEqual([]);
  });

  it('preserves mixed checkboxes', () => {
    const text = '- [ ] Task 1\n- [x] Task 2';
    expect(verifyMarkdownStructure(text, text)).toEqual([]);
  });

  it('detects changed checkbox state', () => {
    const original = '- [ ] Task 1';
    const readback = '- [x] Task 1';
    const issues = verifyMarkdownStructure(original, readback);
    expect(issues.some(i => i.type === 'checkbox_state_changed')).toBe(true);
  });

  it('detects missing checkbox in readback', () => {
    const original = '- [ ] Task 1\n- [ ] Task 2';
    const readback = '- [ ] Task 1';
    const issues = verifyMarkdownStructure(original, readback);
    expect(issues.some(i => i.type === 'checkbox_missing')).toBe(true);
  });
});

describe('verifyMarkdownStructure - Code blocks', () => {
  it('accepts properly paired code blocks', () => {
    const text = '```\ncode\n```';
    expect(verifyMarkdownStructure(text, text)).toEqual([]);
  });

  it('accepts multiple paired code blocks', () => {
    const text = '```\nblock1\n```\n\ntext\n\n```\nblock2\n```';
    expect(verifyMarkdownStructure(text, text)).toEqual([]);
  });

  it('detects unclosed code block in readback', () => {
    const original = '```\ncode\n```';
    const readback = '```\ncode';
    const issues = verifyMarkdownStructure(original, readback);
    expect(issues.some(i => i.type === 'code_block_unclosed')).toBe(true);
  });

  it('detects code block count mismatch', () => {
    const original = '```\ncode1\n```\n\n```\ncode2\n```';
    const readback = '```\ncode1\n```';
    const issues = verifyMarkdownStructure(original, readback);
    expect(issues.some(i => i.type === 'code_block_count_mismatch')).toBe(true);
  });

  it('handles code blocks with language specifier', () => {
    const text = '```typescript\nconst x = 1;\n```';
    expect(verifyMarkdownStructure(text, text)).toEqual([]);
  });
});

describe('verifyMarkdownStructure - Lists', () => {
  it('preserves flat list items', () => {
    const text = '- Item 1\n- Item 2\n- Item 3';
    expect(verifyMarkdownStructure(text, text)).toEqual([]);
  });

  it('preserves nested list indentation', () => {
    const text = '- Item 1\n  - Nested 1\n  - Nested 2\n- Item 2';
    expect(verifyMarkdownStructure(text, text)).toEqual([]);
  });

  it('detects indentation mismatch', () => {
    const original = '- Item 1\n  - Nested';
    const readback = '- Item 1\n- Nested';
    const issues = verifyMarkdownStructure(original, readback);
    expect(issues.some(i => i.type === 'list_indent_mismatch')).toBe(true);
  });

  it('detects list count mismatch', () => {
    const original = '- Item 1\n- Item 2';
    const readback = '- Item 1';
    const issues = verifyMarkdownStructure(original, readback);
    expect(issues.some(i => i.type === 'list_count_mismatch')).toBe(true);
  });

  it('handles asterisk and plus list markers', () => {
    const text = '* Item 1\n+ Item 2';
    expect(verifyMarkdownStructure(text, text)).toEqual([]);
  });
});

describe('verifyMarkdownStructure - Combined', () => {
  it('returns no issues for complex matching documents', () => {
    const doc = `# Title

| Col1 | Col2 |
|------|------|
| A | B |

- [ ] Task 1
- [x] Task 2

\`\`\`typescript
const x = 1;
\`\`\`

- Item 1
  - Nested`;
    expect(verifyMarkdownStructure(doc, doc)).toEqual([]);
  });

  it('reports multiple issue types for corrupted readback', () => {
    const original = '| A | B |\n|---|---|\n| 1 | 2 |\n\n- [ ] Task\n\n```\ncode\n```';
    const readback = '| A | B | C |\n|---|---|---|\n| 1 | 2 |\n\n- [x] Task\n\n```\ncode';
    const issues = verifyMarkdownStructure(original, readback);
    expect(issues.length).toBeGreaterThan(1);
  });
});
