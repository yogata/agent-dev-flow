/**
 * Regression test for command file format violations (IR-049).
 *
 * Validates that all command files in scope comply with the thin Command
 * model (DEC-022, Issue #2428):
 * - Public /agentdev/* commands carry no workflow stage tables, no
 *   `### Step N` procedure headings, and no Workflow Skill internal STEP
 *   identifiers (REQ-002-001, REQ-002-041)
 * - No non-G01 guardrail numbers
 */

import { test, expect } from "bun:test";
import { checkCommandFile } from "./check_command_format.ts";
import * as fs from "fs";
import * as path from "path";

const COMMAND_DIRS = [
  "src/opencode/commands/agentdev",
  ".opencode/commands/repo",
];

function globMarkdown(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => path.join(dir, f));
}

test("command files: no format violations", () => {
  const allViolations: { file: string; violations: ReturnType<typeof checkCommandFile> }[] = [];

  for (const dir of COMMAND_DIRS) {
    const files = globMarkdown(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const violations = checkCommandFile(file, content);
      if (violations.length > 0) {
        allViolations.push({ file, violations });
      }
    }
  }

  if (allViolations.length > 0) {
    const msg = allViolations
      .map(({ file, violations }) =>
        violations.map((v) => `${v.file}:${v.line} ${v.rule}: ${v.description}`).join("\n"),
      )
      .join("\n");
    console.error(`Command format violations found:\n${msg}`);
  }

  expect(allViolations).toHaveLength(0);
});

// Unit tests for the checker itself

const PUBLIC_CMD = "src/opencode/commands/agentdev/test.md";
const REPO_CMD = ".opencode/commands/repo/test.md";

test("checkCommandFile detects ### Step headings in public commands", () => {
  const content = `## workflow

本コマンドは workflow 実装本体を \`agentdev-workflow-demo\` スキルへ委譲する。

### Step 1: 従来形式の残存

text
`;
  const violations = checkCommandFile(PUBLIC_CMD, content);
  expect(
    violations.some((v) => v.rule === "command-format-public-step-heading"),
  ).toBe(true);
});

test("checkCommandFile allows ### Step headings in repo-local commands", () => {
  const content = `## 手順

### Step 1: repo 従来形式

text
`;
  const violations = checkCommandFile(REPO_CMD, content);
  expect(
    violations.some((v) => v.rule === "command-format-public-step-heading"),
  ).toBe(false);
});

test("checkCommandFile detects workflow stage tables in public commands", () => {
  const content = `## workflow

本コマンドは workflow 実装本体を \`agentdev-workflow-demo\` スキルへ委譲する。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 入力解決 | 起動時 | 入力確定 | 入力が解決済みであること |
`;
  const violations = checkCommandFile(PUBLIC_CMD, content);
  expect(
    violations.some((v) => v.rule === "command-format-workflow-table"),
  ).toBe(true);
});

test("checkCommandFile passes thin public command workflow dispatch", () => {
  const content = `## workflow

本コマンドは workflow 実装本体を \`agentdev-workflow-demo\` スキルへ委譲する。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの control plane が所有する。

## ガードレール

- G01: valid
`;
  const violations = checkCommandFile(PUBLIC_CMD, content);
  expect(violations).toHaveLength(0);
});

test("checkCommandFile detects Workflow Skill internal STEP identifiers in public commands", () => {
  const content = `## 不変条件

- 委譲の前に worktree が作成済みであることを STEP-S3 の gate で検証する
`;
  const violations = checkCommandFile(PUBLIC_CMD, content);
  expect(
    violations.some((v) => v.rule === "command-format-workflow-step-id"),
  ).toBe(true);
});

test("checkCommandFile allows non-identifier STEP mentions in public commands", () => {
  const content = `## workflow

本コマンドは workflow 実装本体を \`agentdev-workflow-demo\` スキルへ委譲する。同スキルは STEP model 対象の control plane を所有する。
`;
  const violations = checkCommandFile(PUBLIC_CMD, content);
  expect(
    violations.some((v) => v.rule === "command-format-workflow-step-id"),
  ).toBe(false);
});

test("checkCommandFile detects non-G01 guardrail numbers", () => {
  const content = `## ガードレール

- G1: invalid format
- G001: too many digits
`;
  const violations = checkCommandFile(PUBLIC_CMD, content);
  expect(violations.some((v) => v.rule === "command-format-guardrail-number")).toBe(true);
});
