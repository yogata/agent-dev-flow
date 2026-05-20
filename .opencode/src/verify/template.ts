import type { VerificationIssue } from './types.js';

/**
 * Extract required headings from a template by parsing 【必須】 markers.
 *
 * Logic:
 * - If `<!-- 【必須】 -->` marker follows a heading (## ...), that heading is required
 * - If no marker, the first non-empty line after the heading is used as the required anchor
 */
export function extractRequiredHeadings(template: string): string[] {
  const lines = template.split('\n');
  const headings: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const headingMatch = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (!headingMatch) continue;

    const headingText = headingMatch[2].trim();
    const headingLine = lines[i].trim();

    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.includes('<!-- 【必須】 -->') || nextLine.includes('【必須】')) {
        headings.push(headingLine);
        continue;
      }
    }

    for (let j = i + 1; j < lines.length; j++) {
      const candidateLine = lines[j].trim();
      if (candidateLine === '') continue;
      if (candidateLine.match(/^#{1,6}\s+/)) break;
      headings.push(headingLine);
      break;
    }
  }

  return headings;
}

export function verifyRequiredSections(
  content: string,
  requiredHeadings: string[],
): VerificationIssue[] {
  const issues: VerificationIssue[] = [];
  const lines = content.split('\n');

  for (const heading of requiredHeadings) {
    const headingText = heading.replace(/^#+\s+/, '');

    const found = lines.some((line) => {
      const trimmed = line.trim();
      const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
      if (headingMatch) {
        return headingMatch[1].trim() === headingText;
      }
      return false;
    });

    if (!found) {
      issues.push({
        type: 'missing_required_section',
        description: 'Required section missing',
        details: `Section "${headingText}" not found in content`,
      });
    }
  }

  return issues;
}
