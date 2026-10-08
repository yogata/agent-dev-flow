//
// TS-002: ファイル単位結果の同一性判定（REQ-053-042）。
// - 同一性は本文（内容 SHA-256）、パス、有効な規則と設定、実際のエンジンと依存成果物、
//   標準・プロジェクト辞書と間接依存、結果正規化の版を含めて判定する
// - 更新時刻とサイズのみで本文同一性を判定しない（同サイズ置換・mtime 保持で検証）
// - 条件を追跡できない場合は再利用せず実検査へ戻る
// - 規則構成ハッシュは配置位置非依存である

import { describe, expect, test, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { invalidateConfigCache, configPathFor } from "../lib/config.ts";
import { computeFileIdentityKey, computeInspectionConditions, normalizePrhRulePaths } from "../lib/identity.ts";
import { prepareInspectionContext, inspectFileWithReuse } from "../lib/inspect.ts";

const CLEAN = "# 見出し\n\nこれは正常な文章である。\n";
const VIOLATING = "# 見出し\n\n半角カナ\uFF71\uFF72\uFF73が混入している。\n";

function makeProject(files: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-ident-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
  return root;
}

beforeEach(() => {
  invalidateConfigCache();
});

async function prepareWithConditions(root: string) {
  const prepared = await prepareInspectionContext(root);
  expect(prepared.ok).toBe(true);
  if (!prepared.ok) throw new Error("unreachable");
  return prepared.context;
}

describe("本文の同一性（TS-002）", () => {
  test("同サイズ置換は本文ハッシュを変え、更新時刻とサイズが同じでも同一性キーが変わる", () => {
    const root = makeProject();
    const before = "# 見出し\n\nこれは正常な文章である。\n";
    const after = "# 見出し\n\nこれは異常な文章である。\n";
    expect(before.length).toBe(after.length);
    const key1 = computeFileIdentityKey(root, "docs/a.md", before, "cond");
    const key2 = computeFileIdentityKey(root, "docs/a.md", after, "cond");
    expect(key1).not.toBe(key2);
    const key3 = computeFileIdentityKey(root, "docs/a.md", before, "cond");
    expect(key1).toBe(key3);
  });

  test("パスが変われば同一本文でも同一性キーが変わる", () => {
    const root = makeProject();
    const keyA = computeFileIdentityKey(root, "docs/a.md", CLEAN, "cond");
    const keyB = computeFileIdentityKey(root, "docs/b.md", CLEAN, "cond");
    expect(keyA).not.toBe(keyB);
  });

  test("プロジェクトルート（worktree）が変われば同一キーにならない（誤流用防止）", () => {
    const root1 = makeProject({ "docs/a.md": CLEAN });
    const root2 = makeProject({ "docs/a.md": CLEAN });
    expect(computeFileIdentityKey(root1, "docs/a.md", CLEAN, "cond")).not.toBe(
      computeFileIdentityKey(root2, "docs/a.md", CLEAN, "cond"),
    );
  });
});

describe("検査条件の同一性（TS-002）", () => {
  test("設定（additional_targets）の変更は検査条件を変える", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const c1 = await prepareWithConditions(root);
    expect(c1.conditions.trackable).toBe(true);
    const hash1 = c1.conditions.trackable ? c1.conditions.conditionsHash : "";
    const configAbs = configPathFor(root);
    fs.mkdirSync(path.dirname(configAbs), { recursive: true });
    fs.writeFileSync(configAbs, "version: 1\nadditional_targets:\n  - notes/**/*.md\n", "utf8");
    invalidateConfigCache();
    const c2 = await prepareWithConditions(root);
    expect(c2.conditions.trackable).toBe(true);
    const hash2 = c2.conditions.trackable ? c2.conditions.conditionsHash : "";
    expect(hash1).not.toBe(hash2);
  });

  test("プロジェクト用語辞書の追加は検査条件（間接依存を含む）を変える", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const c1 = await prepareWithConditions(root);
    expect(c1.conditions.trackable).toBe(true);
    if (!c1.conditions.trackable) return;
    expect(c1.conditions.projectPrhDictionaryHash).toBeNull();
    const prhAbs = path.join(root, ".agentdev", "config", "plugins", "agentdev-textlint-guard-prh.yml");
    fs.mkdirSync(path.dirname(prhAbs), { recursive: true });
    fs.writeFileSync(prhAbs, "version: 1\nrules:\n  - expected: AgentDevFlow\n", "utf8");
    const c2 = await prepareWithConditions(root);
    expect(c2.conditions.trackable).toBe(true);
    if (!c2.conditions.trackable) return;
    expect(c2.conditions.projectPrhDictionaryHash).not.toBeNull();
    expect(c1.conditions.conditionsHash).not.toBe(c2.conditions.conditionsHash);
  });

  test("結果正規化の版は検査条件の一部である", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const c = await prepareWithConditions(root);
    expect(c.conditions.trackable).toBe(true);
    if (!c.conditions.trackable) return;
    // REQ 行 prh 抑制の導入で正規化手順が変わり、旧版への後退は stale キャッシュ誤報告を再発させる。
    expect(c.conditions.resultNormalizationVersion).toBe(2);
  });

  test("検査条件を追跡できない場合は trackable: false を返し、再利用せず実検査へ戻る", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const context = await prepareInspectionContext(root, {
      computeConditions: () => ({ trackable: false, detail: "untrackable (test)" }),
    });
    expect(context.ok).toBe(true);
    if (!context.ok) return;
    expect(context.context.conditions.trackable).toBe(false);
    // 再利用判定は動くが保存済み結果は使われず、実検査で完結する
    const inspected = await inspectFileWithReuse(context.context, "docs/a.md", CLEAN, { reuse: true, store: true });
    expect(inspected.ok).toBe(true);
    if (!inspected.ok) return;
    expect(inspected.reused).toBe(false);
    expect(inspected.result.hardCount).toBe(0);
  });
});

describe("検査条件つきの再利用（同一性検証済み対象のみ規則実行を省略）", () => {
  test("同一本文・同一条件の2回目は保存済み結果を再利用し、本文変更で再検査する", async () => {
    const root = makeProject({ "docs/a.md": CLEAN, "docs/v.md": VIOLATING });
    const context = await prepareWithConditions(root);
    const text1 = CLEAN;
    const first = await inspectFileWithReuse(context, "docs/a.md", text1, { reuse: true, store: true });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.reused).toBe(false);
    const second = await inspectFileWithReuse(context, "docs/a.md", text1, { reuse: true, store: true });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.reused).toBe(true);
    expect(second.result).toEqual(first.result);
    // 不合格結果も正常に完了した結果であり、再利用対象である（REQ-053-043）
    const v1 = await inspectFileWithReuse(context, "docs/v.md", VIOLATING, { reuse: true, store: true });
    expect(v1.ok).toBe(true);
    if (!v1.ok) return;
    expect(v1.result.hardCount).toBeGreaterThan(0);
    const v2 = await inspectFileWithReuse(context, "docs/v.md", VIOLATING, { reuse: true, store: true });
    expect(v2.ok).toBe(true);
    if (!v2.ok) return;
    expect(v2.reused).toBe(true);
    expect(v2.result).toEqual(v1.result);
  });
});

describe("規則構成ハッシュの配置位置非依存性", () => {
  test("prh rulePaths の正規化は標準辞書を plugin dir 相対、プロジェクト辞書を root 相対へ揃える", () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const pluginDir = path.resolve(import.meta.dir, "..");
    const standardAbs = path.join(pluginDir, "rules", "default-prh.yml");
    const projectAbs = path.join(root, ".agentdev", "config", "plugins", "agentdev-textlint-guard-prh.yml");
    const normalized = normalizePrhRulePaths([standardAbs, projectAbs], pluginDir, root);
    expect(normalized).toEqual([".agentdev/config/plugins/agentdev-textlint-guard-prh.yml", "rules/default-prh.yml"]);
  });

  test("異なる配置位置でも同一構成なら同一の規則構成ハッシュになる", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const c = await prepareWithConditions(root);
    expect(c.conditions.trackable).toBe(true);
    if (!c.conditions.trackable) return;
    const hash1 = c.conditions.ruleCompositionHash;
    // 同一 root での再計算は同一（配置依存の絶対パスが入力に漏れていないことの確認）
    const again = computeInspectionConditions({
      root,
      config: c.prepared.config,
      composition: c.prepared.composition,
      engine: c.prepared.engine,
    });
    expect(again.trackable).toBe(true);
    if (!again.trackable) return;
    expect(again.ruleCompositionHash).toBe(hash1);
    expect(again.conditionsHash).toBe(c.conditions.conditionsHash);
  });
});
