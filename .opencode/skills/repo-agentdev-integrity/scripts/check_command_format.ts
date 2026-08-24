// ADF-COVERS(implementation): REQ-002-037, REQ-002-038, REQ-002-039, REQ-002-040, REQ-002-041, REQ-051-005, REQ-051-006
// ADF-COVERS(verification): REQ-002-001, REQ-002-041
/**
 * Command file format violation checker (IR-049 + IR-028/029/030/031).
 *
 * Scope: src/opencode/commands/agentdev/*.md and .opencode/commands/repo/*.md
 *
 * Thin Command model (DEC-022, Issue #2428): public /agentdev/* commands do
 * not own workflow stage tables, STEP summaries, or Workflow Skill internal
 * STEP identifiers. The workflow implementation body and the high-level
 * execution structure are owned by the Workflow Skill control plane
 * (REQ-002-001, REQ-002-041). `### Step N` procedure headings are likewise
 * the Workflow Skill side / repo-local command expression.
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

// 公開 /agentdev/* Command ディレクトリ（thin Command モデルの適用対象。
// /repo/* Command は従来形式を維持する）。
const PUBLIC_COMMAND_DIR_PATTERN = /[\\/]commands[\\/]agentdev[\\/]/;

// `## workflow` セクション（thin dispatch のみを置く。工程表は禁止）
const WORKFLOW_SECTION = /^##\s+workflow\s*$/;
const TABLE_ROW = /^\|/;

// Workflow Skill 内部 STEP 識別子（STEP-1, STEP-S3, STEP-W2, STEP-E4, STEP-3-1 等）。
// "STEP model" 等、識別子でない言及は含まない。
const WORKFLOW_STEP_IDENTIFIER = /\bSTEP-[A-Z]?\d/;

export function checkCommandFile(
  filePath: string,
  content: string,
): FormatViolation[] {
  const violations: FormatViolation[] = [];
  const lines = content.split("\n");
  const isPublicCommand = PUBLIC_COMMAND_DIR_PATTERN.test(
    filePath.replace(/\\/g, "/"),
  );

  if (isPublicCommand) {
    // thin Command モデル: 公開 Command は工程表・STEP 手順見出しを持たない。
    // `### Step` 見出しは Workflow Skill 側 STEP reference / repo-local
    // command の表現である（command-file-format.md「手順セクション形式」）。
    for (let i = 0; i < lines.length; i++) {
      if (/^###\s+Step\b/.test(lines[i])) {
        violations.push({
          file: filePath,
          line: i + 1,
          rule: "command-format-public-step-heading",
          description:
            "公開 Command の手順は workflow 委譲のみで記述する（### Step N 見出し列挙は Workflow Skill 側 STEP reference の表現）",
          severity: "NG",
        });
      }
    }

    // `## workflow` セクションを持つ公開 Command は工程表（表行）を含まないこと。
    // 工程一覧・STEP・公開順序の要約は Workflow Skill の control plane が所有する。
    let inWorkflow = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^##\s+[^#]/.test(line)) {
        inWorkflow = WORKFLOW_SECTION.test(line);
        continue;
      }
      if (inWorkflow && TABLE_ROW.test(line)) {
        violations.push({
          file: filePath,
          line: i + 1,
          rule: "command-format-workflow-table",
          description:
            "## workflow セクションは工程表（前出出力検証表）を含まないこと（工程一覧・STEP・公開順序の要約は Workflow Skill の control plane が所有）",
          severity: "NG",
        });
      }
    }

    // 公開 Command は Workflow Skill 内部の STEP 識別子へ依存しない。
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(WORKFLOW_STEP_IDENTIFIER);
      if (m) {
        violations.push({
          file: filePath,
          line: i + 1,
          rule: "command-format-workflow-step-id",
          description: `Workflow Skill 内部 STEP 識別子 '${m[0]}' への依存は禁止（Command は Workflow Skill 名レベルで委譲する）`,
          severity: "NG",
        });
      }
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
