import type { VerificationIssue } from './types.js';

/**
 * Verify encoding integrity between original and readback text.
 *
 * Checks:
 * (a) Japanese character string matching
 * (b) Control character detection (U+0000-U+001F, U+007F-U+009F) excluding newline (U+000A) and tab (U+0009)
 * (c) Non-Unicode replacement character detection (U+FFFD)
 */
export function verifyEncoding(original: string, readback: string): VerificationIssue[] {
  const issues: VerificationIssue[] = [];

  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]+/g;
  const originalJapanese = original.match(japaneseRegex) ?? [];
  const readbackJapanese = readback.match(japaneseRegex) ?? [];

  for (const segment of originalJapanese) {
    const readbackIdx = readbackJapanese.indexOf(segment);
    if (readbackIdx === -1) {
      if (!readback.includes(segment)) {
        const pos = original.indexOf(segment);
        const line = original.substring(0, pos).split('\n').length;
        issues.push({
          type: 'encoding',
          description: 'Japanese text mismatch',
          details: `Original segment "${segment}" not found in readback`,
          line,
          position: pos,
        });
      }
    }
  }

  for (let i = 0; i < readback.length; i++) {
    const code = readback.charCodeAt(i);
    if (
      ((code >= 0x0000 && code <= 0x001f) || (code >= 0x007f && code <= 0x009f)) &&
      code !== 0x000a &&
      code !== 0x0009
    ) {
      const line = readback.substring(0, i).split('\n').length;
      issues.push({
        type: 'control_char',
        description: 'Control character detected',
        details: `U+${code.toString(16).toUpperCase().padStart(4, '0')} at position ${i}`,
        line,
        position: i,
      });
    }
  }

  const replacementRegex = /\uFFFD/g;
  let match: RegExpExecArray | null;
  while ((match = replacementRegex.exec(readback)) !== null) {
    const surrounding = readback.substring(Math.max(0, match.index - 10), match.index + 10);
    const originalSurrounding = original.substring(Math.max(0, match.index - 10), Math.min(original.length, match.index + 10));
    if (!original.includes('\uFFFD') || surrounding !== originalSurrounding) {
      const line = readback.substring(0, match.index).split('\n').length;
      issues.push({
        type: 'replacement_char',
        description: 'Unicode replacement character detected',
        details: `\uFFFD (U+FFFD) at position ${match.index}`,
        line,
        position: match.index,
      });
    }
  }

  return issues;
}
