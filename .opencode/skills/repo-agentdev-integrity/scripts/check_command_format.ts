/**
 * Command file format violation checker.
 *
 * Detects violations per docs/specs/command-file-format.md:
 * - Step 0 usage (### Step 0 heading or body "Step 0" reference)
 * - Non-sequential Step numbers under ## 手順
 * - Zero-based substeps (Step N-0)
 * - Numbered list main steps directly under ## 手順
 * - Non-G01 guardrail numbers (not G + 2-digit zero-padded)
 *
 * Scope: src/opencode/commands/agentdev/*.md and .opencode/commands/repo/*.md
 */

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

export interface FormatViolation {
  file: string;
  line: number;
  rule: string;
  description: string;
  severity: "NG" | "WARNING";
}

const COMMAND_DIRS = [
  "src/opencode/commands/agentdev",
  ".opencode/commands/repo",
];

const STEP_ZERO_HEADING = /^###\s+Step\s+0\b/;
const STEP_ZERO_REF = /\bStep\s+0\b/;
const STEP_HEADING = /^###\s+Step\s+(\d+)(?:-(\d+))?\s*:/;
const NUMBERED_LIST_MAIN = /^\d+\.\s/;
const GUARDRAIL_LINE = /^-\s+(G\d+):/;
const G01_FORMAT = /^G\d{2}$/;

function findProcedureSection(lines: string[]): { start: number; end: number } | null {
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+手順\s*$/.test(lines[i])) {
      start = i;
      continue;
    }
    if (start >= 0 && /^##\s+[^#]/.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (start < 0) return null;
  return { start: start + 1, end };
}

export function checkCommandFile(
  filePath: string,
  content: string,
): FormatViolation[] {
  const violations: FormatViolation[] = [];
  const lines = content.split("\n");
  const proc = findProcedureSection(lines);

  // Check for Step 0 in headings (anywhere in file)
  for (let i = 0; i < lines.length; i++) {
    if (STEP_ZERO_HEADING.test(lines[i])) {
      violations.push({
        file: filePath,
        line: i + 1,
        rule: "command-format-step-zero",
        description: "Step 0 見出しは禁止（Step 1 から開始）",
        severity: "NG",
      });
    }
  }

  // Check for Step 0 references in body text (within 手順 section)
  if (proc) {
    for (let i = proc.start; i < proc.end; i++) {
      if (STEP_ZERO_REF.test(lines[i]) && !STEP_ZERO_HEADING.test(lines[i])) {
        violations.push({
          file: filePath,
          line: i + 1,
          rule: "command-format-step-zero-ref",
          description: "Step 0 参照は禁止（Step 1 から開始）",
          severity: "NG",
        });
      }
    }

    // Check for numbered list main steps directly under ## 手順
    let inSubSection = false;
    for (let i = proc.start; i < proc.end; i++) {
      const line = lines[i];
      // Track ### headings within 手順
      if (/^###\s/.test(line)) {
        inSubSection = true;
        continue;
      }
      // If we hit a numbered list item at column 0 within 手順
      // (not inside a ### Step heading section), it's a violation
      if (NUMBERED_LIST_MAIN.test(line) && !inSubSection) {
        violations.push({
          file: filePath,
          line: i + 1,
          rule: "command-format-numbered-list-main",
          description:
            "## 手順 直下の numbered list による主手順は禁止（### Step N: 見出しを使用）",
          severity: "NG",
        });
      }
    }

    // Check for non-sequential Step numbers
    const stepNumbers: { num: number; line: number }[] = [];
    for (let i = proc.start; i < proc.end; i++) {
      const match = lines[i].match(STEP_HEADING);
      if (match && !match[2]) {
        // Main step only (no substep)
        stepNumbers.push({ num: parseInt(match[1]), line: i + 1 });
      }
    }
    // Check sequential: each step should be prev + 1
    for (let i = 1; i < stepNumbers.length; i++) {
      const prev = stepNumbers[i - 1].num;
      const curr = stepNumbers[i].num;
      if (curr !== prev + 1) {
        violations.push({
          file: filePath,
          line: stepNumbers[i].line,
          rule: "command-format-non-sequential-step",
          description: `Step 番号が非連続: Step ${prev} → Step ${curr}（飛び番）`,
          severity: "NG",
        });
      }
    }
  }

  // Check for zero-based substeps (Step N-0) anywhere in file
  for (let i = 0; i < lines.length; i++) {
    if (/\bStep\s+\d+-0\b/.test(lines[i]) || /\*\*\d+-0\./.test(lines[i])) {
      violations.push({
        file: filePath,
        line: i + 1,
        rule: "command-format-zero-substep",
        description: "ゼロ起点サブステップ Step N-0 は禁止（Step N-1 から開始）",
        severity: "NG",
      });
    }
  }

  // Check for non-G01 guardrail numbers (G + exactly 2 digits zero-padded)
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(GUARDRAIL_LINE);
    if (match && !G01_FORMAT.test(match[1])) {
      violations.push({
        file: filePath,
        line: i + 1,
        rule: "command-format-guardrail-number",
        description: `ガードレール番号 ${match[1]} は G01 形式（G + ゼロ埋め2桁）に不一致`,
        severity: "NG",
      });
    }
  }

  return violations;
}

function globMarkdown(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".md") && f !== "README.md")
    .map((f: string) => path.join(dir, f));
}

export function runCheckCommandFormat(): FormatViolation[] {
  const allViolations: FormatViolation[] = [];

  // Find repo root by looking for .git
  let repoRoot = process.cwd();
  while (repoRoot !== "/" && !fs.existsSync(path.join(repoRoot, ".git"))) {
    repoRoot = path.dirname(repoRoot);
  }

  for (const dir of COMMAND_DIRS) {
    const fullDir = path.join(repoRoot, dir);
    const files = globMarkdown(fullDir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const violations = checkCommandFile(file, content);
      allViolations.push(...violations);
    }
  }

  return allViolations;
}
