/**
 * Regression test for §5.4 lifecycle 誤検知の修正。
 *
 * 現行 Case 状態（open/running/blocked/review/closed/cancelled）に含まれる `review` 単語が
 * 旧6状態モデル（requirement/analyzed/created/in_progress/review/done）と誤認されないこと。
 * 旧状態モデルを宣言する構造は引き続き検出すること。
 *
 * 移行計画 §5.4、TS-002。
 */
import { describe, test, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const SCRIPTS_DIR = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "scripts",
);
const CHECK_INTEGRITY = path.join(SCRIPTS_DIR, "check_integrity.ts");
const TEMP_BASE = path.join("C:", "WINDOWS", "TEMP", "opencode");

function runCheckIntegrity(root: string): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  const proc = Bun.spawnSync([
    "bun",
    "run",
    CHECK_INTEGRITY,
    "--root",
    root,
    "--json",
  ]);
  return {
    exitCode: proc.exitCode ?? -1,
    stdout: proc.stdout.toString(),
    stderr: proc.stderr.toString(),
  };
}

function buildSpecsDir(root: string, specFile: string, content: string): void {
  const specsDir = path.join(root, "docs", "specs");
  fs.mkdirSync(specsDir, { recursive: true });
  fs.writeFileSync(path.join(specsDir, specFile), content, "utf-8");
}

const CURRENT_CASE_STATES_CONTENT = `---
title: テスト用 SPEC
status: accepted
---

# Case 状態一覧

Case の現行状態は次の6種類である。

| 状態 | 説明 |
|---|---|
| open | 未着手 |
| running | 実行中 |
| blocked | ブロック中 |
| review | レビュー中 |
| closed | クローズ済 |
| cancelled | キャンセル済 |
`;

const LEGACY_6PHASE_CONTENT = `---
title: テスト用 SPEC
status: accepted
---

# 旧状態モデル

旧状態モデルは次の6フェーズで構成される。各状態（status）は requirement から始まり、analyzed、created、in_progress、review を経て done へ至る。

## 状態遷移表

- requirement status: 要件定義中
- analyzed status: 分析済
- created status: Issue 作成済
- in_progress status: 実行中
- review status: レビュー中
- done status: 完了
`;

describe("regression_lifecycle_review_false_positive: §5.4 lifecycle 誤検知修正", () => {
  test("現行Case状態(open/running/blocked/review/closed/cancelled)は violation にならない", () => {
    const root = fs.mkdtempSync(path.join(TEMP_BASE, "lifecycle-current-"));
    try {
      buildSpecsDir(root, "current-states.md", CURRENT_CASE_STATES_CONTENT);
      const r = runCheckIntegrity(root);
      const parsed = JSON.parse(r.stdout);
      const violations = (parsed.results as Array<{ check: string; level: string }>).filter(
        (res) =>
          res.check === "workflow-status-prohibition" && res.level === "ng",
      );
      expect(violations.length).toBe(0);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("旧状態モデル(requirement/analyzed/created/in_progress/review/done)は violation になる", () => {
    const root = fs.mkdtempSync(path.join(TEMP_BASE, "lifecycle-legacy-"));
    try {
      buildSpecsDir(root, "legacy-states.md", LEGACY_6PHASE_CONTENT);
      const r = runCheckIntegrity(root);
      const parsed = JSON.parse(r.stdout);
      const violations = (parsed.results as Array<{ check: string; level: string }>).filter(
        (res) =>
          res.check === "workflow-status-prohibition" && res.level === "ng",
      );
      expect(violations.length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
