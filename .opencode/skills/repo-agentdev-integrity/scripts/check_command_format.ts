/**
 * Command file format violation checker (IR-049 + IR-028/029/030/031).
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

// IR-028: ### Step <letter>: 禁止
const IR028_FORBIDDEN_HEADING = /^###\s+Step\s+[A-Za-z]/;
// IR-029: Step 1-a, Step 1-b 禁止
const IR029_FORBIDDEN_SUBSTEP = /\bStep\s+\d+-[A-Za-z]\b/;
// IR-030: 無条件 verbatim 禁止（条件付き verbatim は許容）
const IR030_FORBIDDEN_VERBATIM = /verbatim\s+で返却|verbatim\s+必須/;
const IR030_EXEMPTION_HINTS = ["成果物本文のみ", "verbatim 区切子", "conditional"];
// IR-031: 非統一 Findings 見出し禁止（正統は ## Findings / Capture候補）
const IR031_FORBIDDEN_PRIMARY_HEADING = /^##\s+(Capture|Intake\s+候補|Learning\s+候補)\s*$/;

const COMMAND_DIRS = [
  "src/opencode/commands/agentdev",
  ".opencode/commands/repo",
];

const STEP_ZERO_HEADING = /^###\s+Step\s+0\b/;
const STEP_ZERO_REF = /\bStep\s+0\b/;
const STEP_HEADING = /^###\s+Step\s+(\d+)(?:〜(\d+))?(?:-(\d+))?\s*:/;
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
    const stepNumbers: { start: number; end: number; line: number }[] = [];
    for (let i = proc.start; i < proc.end; i++) {
      const match = lines[i].match(STEP_HEADING);
      if (match && !match[3]) {
        // Main step only (no substep)
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : start;
        stepNumbers.push({ start, end, line: i + 1 });
      }
    }
    // Check sequential: each step should be prev + 1
    for (let i = 1; i < stepNumbers.length; i++) {
      const prev = stepNumbers[i - 1].end;
      const curr = stepNumbers[i].start;
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

  // Check for zero-based substeps (Step N-0) anywhere in file.
  //
  // Permissive criteria (Issue #1562 AG-003 option A):
  //   Step N-0 を許容するのは、同ファイルに Step N-M (M >= 1) 兄弟が
  //   存在する場合に限定する。「主 Step N 本体の前処理（preparatory
  //   substep）」パターン（Step 4-0 の後に Step 4-1, 4-2 ... が続く）を
  //   認めつつ、兄弟が存在しない孤立 Step N-0 は Step N へ統合または
  //   Step N-1 へリネームを要求する。
  //
  //   1. 当該 Step は子ステップを持たない単独工程であること
  //   2. 同一 command 内で他の Step が Step N-M (M >= 1) 形式を採用しており
  //      番号体系の一貫性を保つ必要があること
  //   3. 機械検査が条件を誤検知対象外として認識できること（本実装）
  //
  // 後続 SPEC docs/specs/authoring/command-authoring-standards.md の
  // 「Step X-Y 表記許容基準」セクションにて条文化予定（AG-001 引継ぎ）。
  const substepSiblings = new Map<number, Set<number>>();
  for (const line of lines) {
    for (const m of line.matchAll(/\bStep\s+(\d+)-(\d+)\b/g)) {
      const parent = parseInt(m[1], 10);
      const sub = parseInt(m[2], 10);
      if (!substepSiblings.has(parent)) {
        substepSiblings.set(parent, new Set());
      }
      substepSiblings.get(parent)!.add(sub);
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const zeroParents: number[] = [];
    for (const m of line.matchAll(/\bStep\s+(\d+)-0\b/g)) {
      zeroParents.push(parseInt(m[1], 10));
    }
    for (const m of line.matchAll(/\*\*(\d+)-0\./g)) {
      zeroParents.push(parseInt(m[1], 10));
    }
    for (const parent of zeroParents) {
      const siblings = substepSiblings.get(parent) ?? new Set<number>();
      const hasPositiveSibling = Array.from(siblings).some((s) => s >= 1);
      if (!hasPositiveSibling) {
        violations.push({
          file: filePath,
          line: i + 1,
          rule: "command-format-zero-substep",
          description: `ゼロ起点サブステップ Step ${parent}-0 は Step ${parent}-1 以降の兄弟が同ファイルに存在しないため禁止（Step ${parent}-1 から開始、または Step ${parent} へ統合）`,
          severity: "NG",
        });
      }
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

  // IR-028: alphabet 混在 Step 見出し検出
  for (let i = 0; i < lines.length; i++) {
    if (IR028_FORBIDDEN_HEADING.test(lines[i])) {
      violations.push({
        file: filePath,
        line: i + 1,
        rule: "ir028-command-top-step-alphabet",
        description: "Step 見出しに英字混在は禁止（### Step N: 整数形式を使用）",
        severity: "NG",
      });
    }
  }

  // IR-029: 英字サブステップ検出
  for (let i = 0; i < lines.length; i++) {
    if (IR029_FORBIDDEN_SUBSTEP.test(lines[i])) {
      violations.push({
        file: filePath,
        line: i + 1,
        rule: "ir029-command-alphabet-substep",
        description: "英字サブステップ（Step N-a 等）は禁止（Step N-M 整数形式を使用）",
        severity: "NG",
      });
    }
  }

  // IR-030: 無条件 verbatim 検出（exemption hint がある行は skip）
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!IR030_FORBIDDEN_VERBATIM.test(line)) continue;
    const hasExemption = IR030_EXEMPTION_HINTS.some((h) => line.includes(h));
    if (hasExemption) continue;
    violations.push({
      file: filePath,
      line: i + 1,
      rule: "ir030-subagent-unconditional-verbatim",
      description: "無条件 verbatim 要求は禁止（条件付き verbatim のみ許容）",
      severity: "NG",
    });
  }

  // IR-031: 非統一 Findings 見出し検出（command 本文内の指導記述）
  for (let i = 0; i < lines.length; i++) {
    if (IR031_FORBIDDEN_PRIMARY_HEADING.test(lines[i])) {
      violations.push({
        file: filePath,
        line: i + 1,
        rule: "ir031-findings-capture-heading-unification",
        description: "Findings 見出しは ## Findings / Capture候補 形式を使用",
        severity: "WARNING",
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

export function runCheckCommandFormat(explicitRoot?: string): FormatViolation[] {
  const allViolations: FormatViolation[] = [];

  // Find repo root by looking for .git
  let repoRoot = explicitRoot ? path.resolve(explicitRoot) : process.cwd();
  while (!fs.existsSync(path.join(repoRoot, ".git"))) {
    const parent = path.dirname(repoRoot);
    if (parent === repoRoot) break;
    repoRoot = parent;
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

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("usage: bun run check_command_format.ts [--root <path>] [--json]");
    process.exit(0);
  }
  const rootIndex = args.indexOf("--root");
  const explicitRoot = rootIndex >= 0 ? args[rootIndex + 1] : undefined;
  if (rootIndex >= 0 && !explicitRoot) {
    console.error("check_command_format.ts: --root requires a path");
    process.exit(2);
  }
  const violations = runCheckCommandFormat(explicitRoot);
  if (args.includes("--json")) {
    console.log(JSON.stringify({ ok: violations.length === 0, violations }, null, 2));
  } else if (violations.length === 0) {
    console.log("check_command_format.ts: OK");
  } else {
    for (const violation of violations) {
      console.log(`${violation.severity} ${violation.file}:${violation.line} ${violation.rule} ${violation.description}`);
    }
  }
  process.exit(violations.length === 0 ? 0 : 1);
}
