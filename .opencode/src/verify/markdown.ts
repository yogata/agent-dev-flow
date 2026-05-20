import type { VerificationIssue } from './types.js';

/**
 * Verify Markdown structure integrity between original and readback text.
 *
 * Checks:
 * (a) Tables: each row's column count must match
 * (b) Checkboxes: `- [ ]` and `- [x]` syntax must be preserved
 * (c) Code blocks: ``` opening/closing pairs must match
 * (d) Lists: indentation hierarchy must be preserved
 */
export function verifyMarkdownStructure(original: string, readback: string): VerificationIssue[] {
  const issues: VerificationIssue[] = [];

  issues.push(...verifyTables(original, readback));
  issues.push(...verifyCheckboxes(original, readback));
  issues.push(...verifyCodeBlocks(original, readback));
  issues.push(...verifyListIndentation(original, readback));

  return issues;
}

function verifyTables(original: string, readback: string): VerificationIssue[] {
  const issues: VerificationIssue[] = [];

  const lines = readback.split('\n');
  let tableStartLine = -1;
  let headerColumnCount = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trimStart().startsWith('|')) {
      if (tableStartLine === -1) {
        tableStartLine = i + 1;
        headerColumnCount = countPipeColumns(line);
      } else if (headerColumnCount === -1 || isSeparatorRow(line)) {
        continue;
      } else {
        const rowColumns = countPipeColumns(line);
        if (rowColumns !== headerColumnCount) {
          issues.push({
            type: 'table_column_mismatch',
            description: 'Table row column count mismatch',
            details: `Expected ${headerColumnCount} columns but found ${rowColumns}`,
            line: i + 1,
          });
        }
      }
    } else {
      tableStartLine = -1;
      headerColumnCount = -1;
    }
  }

  const originalTables = extractTableHeaders(original);
  for (const table of originalTables) {
    if (!readback.includes(table)) {
      issues.push({
        type: 'table_missing',
        description: 'Table header missing from readback',
        details: `Table header "${table.trim()}" not found in readback`,
      });
    }
  }

  return issues;
}

function countPipeColumns(line: string): number {
  const trimmed = line.trim();
  const pipes = trimmed.split('|');
  return pipes.filter((_, idx) => idx > 0 && idx < pipes.length - 1).length || pipes.length - 1;
}

function isSeparatorRow(line: string): boolean {
  return /^\|?\s*[-:]+[-| :]*\|?\s*$/.test(line.trim());
}

function extractTableHeaders(text: string): string[] {
  const lines = text.split('\n');
  const headers: string[] = [];
  for (const line of lines) {
    if (line.trimStart().startsWith('|') && !isSeparatorRow(line)) {
      headers.push(line);
    }
  }
  return headers;
}

function verifyCheckboxes(original: string, readback: string): VerificationIssue[] {
  const issues: VerificationIssue[] = [];

  const originalLines = original.split('\n');
  const readbackLines = readback.split('\n');

  const originalMatches: Array<{ text: string; indent: number; line: number }> = [];
  for (let i = 0; i < originalLines.length; i++) {
    const cbMatch = originalLines[i].match(/^(\s*)- \[([ x])\]/);
    if (cbMatch) {
      originalMatches.push({
        text: cbMatch[2] === 'x' ? '- [x]' : '- [ ]',
        indent: cbMatch[1].length,
        line: i + 1,
      });
    }
  }

  const readbackMatches: Array<{ text: string; indent: number; line: number }> = [];
  for (let i = 0; i < readbackLines.length; i++) {
    const cbMatch = readbackLines[i].match(/^(\s*)- \[([ x])\]/);
    if (cbMatch) {
      readbackMatches.push({
        text: cbMatch[2] === 'x' ? '- [x]' : '- [ ]',
        indent: cbMatch[1].length,
        line: i + 1,
      });
    }
  }

  for (let i = 0; i < originalMatches.length; i++) {
    const orig = originalMatches[i];
    if (i >= readbackMatches.length) {
      issues.push({
        type: 'checkbox_missing',
        description: 'Checkbox missing from readback',
        details: `Expected checkbox "${orig.text}" at index ${i} not found`,
        line: orig.line,
      });
    } else {
      const rb = readbackMatches[i];
      if (orig.text !== rb.text) {
        issues.push({
          type: 'checkbox_state_changed',
          description: 'Checkbox state changed',
          details: `Expected "${orig.text}" but found "${rb.text}" at index ${i}`,
          line: rb.line,
        });
      }
    }
  }

  return issues;
}

function verifyCodeBlocks(original: string, readback: string): VerificationIssue[] {
  const issues: VerificationIssue[] = [];

  const readbackLines = readback.split('\n');
  let fenceCount = 0;
  let fenceLine = -1;

  for (let i = 0; i < readbackLines.length; i++) {
    if (readbackLines[i].trimStart().startsWith('```')) {
      fenceCount++;
      if (fenceCount % 2 === 1) {
        fenceLine = i + 1;
      } else {
        fenceLine = -1;
      }
    }
  }

  if (fenceCount % 2 !== 0) {
    issues.push({
      type: 'code_block_unclosed',
      description: 'Code block not properly closed',
      details: `Unclosed code block starting at line ${fenceLine}`,
      line: fenceLine,
    });
  }

  const originalFenceCount = (original.match(/^```/gm) || []).length;
  if (originalFenceCount !== fenceCount) {
    issues.push({
      type: 'code_block_count_mismatch',
      description: 'Code block count mismatch',
      details: `Original has ${originalFenceCount} fences, readback has ${fenceCount}`,
    });
  }

  return issues;
}

function verifyListIndentation(original: string, readback: string): VerificationIssue[] {
  const issues: VerificationIssue[] = [];

  const listItemRegex = /^(\s*)[-*+]\s/;
  const originalLines = original.split('\n');
  const readbackLines = readback.split('\n');

  const originalItems: Array<{ indent: number; line: number; text: string }> = [];
  const readbackItems: Array<{ indent: number; line: number; text: string }> = [];

  for (let i = 0; i < originalLines.length; i++) {
    const m = originalLines[i].match(listItemRegex);
    if (m) {
      originalItems.push({ indent: m[1].length, line: i + 1, text: originalLines[i].trim() });
    }
  }

  for (let i = 0; i < readbackLines.length; i++) {
    const m = readbackLines[i].match(listItemRegex);
    if (m) {
      readbackItems.push({ indent: m[1].length, line: i + 1, text: readbackLines[i].trim() });
    }
  }

  const minLength = Math.min(originalItems.length, readbackItems.length);
  for (let i = 0; i < minLength; i++) {
    if (originalItems[i].indent !== readbackItems[i].indent) {
      issues.push({
        type: 'list_indent_mismatch',
        description: 'List indentation not preserved',
        details: `Item "${originalItems[i].text}" expected indent ${originalItems[i].indent}, got ${readbackItems[i].indent}`,
        line: readbackItems[i].line,
      });
    }
  }

  if (originalItems.length !== readbackItems.length) {
    issues.push({
      type: 'list_count_mismatch',
      description: 'List item count mismatch',
      details: `Original has ${originalItems.length} list items, readback has ${readbackItems.length}`,
    });
  }

  return issues;
}
