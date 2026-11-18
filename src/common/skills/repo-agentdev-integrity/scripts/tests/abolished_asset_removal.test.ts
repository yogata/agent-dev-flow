// ADF-COVERS(verification): REQ-122-002, REQ-122-004
// 恒常検証: Wave-1（#4153・merge abe27dd60）が削除した廃止32 IR ルール定義と
// AG-002 連動資産・旧 learning ファイルが復活していないこと（REQ-122-002）、
// learning の 1トピック1ファイル構造（inbox/・deferred/ ディレクトリ）が
// 維持されていること（REQ-122-004）を検証する。
// テスト実行 cwd はリポジトリルート（REQ-060 bun test 実行形態）を前提とする。

import { test, expect } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = process.cwd();

// Wave-1（abe27dd60）の削除対象資産（AG-002 列挙 11 資産と旧 learning 2 ファイル）。
// 削除根拠は Issue #4153 の完了条件と PR #4157 の変更一覧（diff --diff-filter=D と一致）。
const REMOVED_ASSETS: readonly string[] = [
  ".agentdev/config/plugins/agentdev-textlint-guard-prh.yml",
  ".agentdev/config/plugins/agentdev-textlint-guard.yaml",
  ".agentdev/learning/inbox.md",
  ".agentdev/learning/deferred.md",
  ".opencode/skills/repo-agentdev-integrity/data/command-format-rules.yaml",
  ".opencode/skills/repo-agentdev-integrity/data/delegation-contract-patterns.yaml",
  ".opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md",
  ".opencode/skills/repo-agentdev-integrity/scripts/textlint_guard_project_config.test.ts",
  "docs/designs/authoring/command-file-format.md",
  "docs/designs/authoring/vocabulary-registry.md",
  "docs/designs/integrity/content-corruption-checker.md",
  "docs/designs/integrity/prose-quality-sentinel-checks.md",
  "docs/designs/quality/textlint-quality-runtime.md",
];

// 廃止された 32 IR ルール ID（Wave-1 削除確定集合。残存 24 + IR-075 の 25 構成は
// generate_indexes_catalog.test.ts が検証するため、ここでは廃止側の不在のみ検証する）。
const ABOLISHED_RULE_IDS: readonly string[] = [
  "005", "006", "010", "012", "015", "018", "025", "027", "028", "029", "030",
  "031", "032", "033", "034", "035", "037", "038", "039", "040", "041", "042",
  "043", "048", "049", "050", "051", "052", "060", "072", "073", "074",
];

test("REQ-122-002: Wave-1 削除対象の連動資産が復活していないこと", () => {
  for (const rel of REMOVED_ASSETS) {
    expect(
      fs.existsSync(path.join(REPO_ROOT, rel)),
      `${rel} は削除済みであること`,
    ).toBe(false);
  }
});

test("REQ-122-002: 廃止32 IR ルール定義が docs/designs/integrity/rules/ に復活していないこと", () => {
  const rulesDir = path.join(REPO_ROOT, "docs", "designs", "integrity", "rules");
  const presentIds = new Set(
    fs.readdirSync(rulesDir).map((name) => name.replace(/^IR-(\d{3}).*$/, "$1")),
  );
  for (const id of ABOLISHED_RULE_IDS) {
    expect(presentIds.has(id), `IR-${id} のルール定義は削除済みであること`).toBe(false);
  }
});

test("REQ-122-004: learning inbox・deferred が 1トピック1ファイル構造であること", () => {
  const inboxDir = path.join(REPO_ROOT, ".agentdev", "learning", "inbox");
  const deferredDir = path.join(REPO_ROOT, ".agentdev", "learning", "deferred");
  expect(fs.existsSync(path.join(inboxDir, ".gitkeep")), "learning/inbox/.gitkeep が存在すること").toBe(true);
  expect(fs.existsSync(path.join(deferredDir, ".gitkeep")), "learning/deferred/.gitkeep が存在すること").toBe(true);
  // 旧ファイル（inbox.md・deferred.md）の不存在は REMOVED_ASSETS の検証が担う。
});
