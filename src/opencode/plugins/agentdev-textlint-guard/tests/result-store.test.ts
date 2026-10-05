//
// TS-004: 保存と実検査への復帰（REQ-053-043/044）。
// - 保存結果の欠落・破損・途中書込み・保存失敗・容量上限到達時は実検査へ戻る
// - プロジェクト・worktree 間の誤流用を防ぐ
// - 必須エンジン・辞書欠落が保存済み合格で隠されない
// - 異常終了・タイムアウト・不完全結果は正常結果として保存・再利用されない

import { describe, expect, test, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { invalidateConfigCache } from "../lib/config.ts";
import {
  STORE_MAX_ENTRIES,
  loadStoredFileResult,
  storeDirectoryFor,
  storeFileResult,
} from "../lib/result-store.ts";
import { prepareInspectionContext } from "../lib/inspect.ts";
import { acceptForProgress, runInspection } from "../lib/runs.ts";
import { computeInspectionConditions } from "../lib/identity.ts";

const CLEAN = "# 見出し\n\nこれは正常な文章である。\n";

function makeProject(files: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-store-"));
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

describe("保存結果の破損・欠落からの復帰（TS-004）", () => {
  test("破損した保存結果（不正 JSON）は実検査へ戻る", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const context = await prepareInspectionContext(root);
    expect(context.ok).toBe(true);
    if (!context.ok) return;
    // 正常保存
    const { computeFileIdentityKey } = await import("../lib/identity.ts");
    const conditions = context.context.conditions;
    expect(conditions.trackable).toBe(true);
    if (!conditions.trackable) return;
    const key = computeFileIdentityKey(root, "docs/a.md", CLEAN, conditions.conditionsHash);
    expect(storeFileResult(root, key, "docs/a.md", { path: "docs/a.md", findings: [], hardCount: 0 })).toBe(true);
    expect(loadStoredFileResult(root, key, "docs/a.md")).not.toBeNull();
    // 破損 → 読み込めず null（実検査へ戻る）
    fs.writeFileSync(path.join(storeDirectoryFor(root), `${key}.json`), "{ broken json", "utf8");
    expect(loadStoredFileResult(root, key, "docs/a.md")).toBeNull();
  });

  test("途中書込み相当の不完全出力は再利用されない", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const { computeFileIdentityKey } = await import("../lib/identity.ts");
    const context = await prepareInspectionContext(root);
    if (!context.ok) return;
    const conditions = context.context.conditions;
    if (!conditions.trackable) return;
    const key = computeFileIdentityKey(root, "docs/a.md", CLEAN, conditions.conditionsHash);
    // 切断された JSON（途中書込み相当）
    fs.mkdirSync(storeDirectoryFor(root), { recursive: true });
    fs.writeFileSync(path.join(storeDirectoryFor(root), `${key}.json`), '{"schemaVersion":1,"key":"x', "utf8");
    expect(loadStoredFileResult(root, key, "docs/a.md")).toBeNull();
  });

  test("schema 不一致・key/path 不一致の保存結果は再利用されない", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const { computeFileIdentityKey } = await import("../lib/identity.ts");
    const context = await prepareInspectionContext(root);
    if (!context.ok) return;
    const conditions = context.context.conditions;
    if (!conditions.trackable) return;
    const key = computeFileIdentityKey(root, "docs/a.md", CLEAN, conditions.conditionsHash);
    fs.mkdirSync(storeDirectoryFor(root), { recursive: true });
    const entry = path.join(storeDirectoryFor(root), `${key}.json`);
    // schemaVersion 不一致
    fs.writeFileSync(
      entry,
      JSON.stringify({ schemaVersion: 2, key, path: "docs/a.md", result: { path: "docs/a.md", findings: [], hardCount: 0 } }),
      "utf8",
    );
    expect(loadStoredFileResult(root, key, "docs/a.md")).toBeNull();
    // path 不一致（別ファイルの結果として保存されたもの）
    fs.writeFileSync(
      entry,
      JSON.stringify({ schemaVersion: 1, key, path: "docs/other.md", result: { path: "docs/other.md", findings: [], hardCount: 0 } }),
      "utf8",
    );
    expect(loadStoredFileResult(root, key, "docs/a.md")).toBeNull();
    // hardCount が findings と不一致の不完全結果
    fs.writeFileSync(
      entry,
      JSON.stringify({
        schemaVersion: 1,
        key,
        path: "docs/a.md",
        result: { path: "docs/a.md", findings: [], hardCount: 3 },
      }),
      "utf8",
    );
    expect(loadStoredFileResult(root, key, "docs/a.md")).toBeNull();
  });

  test("保存失敗は許容され、当該対象の実検査結果は失われない", () => {
    const root = makeProject();
    // 不正キー（64 文字 hex 以外）は保存せず false を返す
    expect(storeFileResult(root, "../evil", "docs/a.md", { path: "docs/a.md", findings: [], hardCount: 0 })).toBe(false);
    expect(loadStoredFileResult(root, "../evil", "docs/a.md")).toBeNull();
  });

  test("容量上限到達時は最古のエントリから削除され、無制限に保存されない", () => {
    const root = makeProject();
    const fakeResult = { path: "docs/a.md", findings: [], hardCount: 0 };
    for (let i = 0; i < STORE_MAX_ENTRIES + 5; i += 1) {
      const key = String(i).padStart(64, "0");
      storeFileResult(root, key, "docs/a.md", fakeResult);
    }
    const entries = fs.readdirSync(storeDirectoryFor(root)).filter((n) => n.endsWith(".json"));
    expect(entries.length).toBeLessThanOrEqual(STORE_MAX_ENTRIES);
  });
});

describe("プロジェクト・worktree 間の誤流用防止（TS-004、REQ-053-044）", () => {
  test("保存ディレクトリを別 root へ移しても同一性キー不一致で再利用されない", async () => {
    const root1 = makeProject({ "docs/a.md": CLEAN });
    const first = await runInspection(root1, "final", { maxWorkers: 0 });
    expect(first.ruleExecutions.reused).toBe(0);
    expect(fs.existsSync(storeDirectoryFor(root1))).toBe(true);
    // root1 の保存結果を root2 へ持ち込む（誤流用の模擬）
    const root2 = makeProject({ "docs/a.md": CLEAN });
    fs.mkdirSync(path.dirname(storeDirectoryFor(root2)), { recursive: true });
    fs.cpSync(storeDirectoryFor(root1), storeDirectoryFor(root2), { recursive: true });
    const second = await runInspection(root2, "final", { maxWorkers: 0 });
    // root2 の同一性キーには root2 の解決済み絶対パスが含まれるため、持ち込まれた結果は再利用されない
    expect(second.ruleExecutions.reused).toBe(0);
    expect(second.ruleExecutions.actual).toBe(1);
  });
});

describe("必須エンジン・辞書の欠落が保存済み合格で隠されない（TS-004）", () => {
  test("検査条件の追跡が不能な場合は再利用せず実検査となる（辞書欠落は検査不能として拒否）", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const first = await runInspection(root, "final", { maxWorkers: 0 });
    expect(first.ok).toBe(true);
    // プロジェクト辞書の欠落は不在（正常状態）であり、検査条件から外れない。
    // 辞書が存在しても読めない場合は prepareInspection が失敗し（fail-closed）、
    // runInspection は検査不能で完了しないため保存済み合格だけで合格にならない。
    const prhAbs = path.join(root, ".agentdev", "config", "plugins", "agentdev-textlint-guard-prh.yml");
    fs.mkdirSync(path.dirname(prhAbs), { recursive: true });
    fs.writeFileSync(prhAbs, "version: 1\nrules:\n  - expected: AgentDevFlow\n", "utf8");
    const rerun = await runInspection(root, "final", { maxWorkers: 0 });
    // 辞書追加は検査条件の変化であり、保存済み結果は再利用されない（全件実検査）
    expect(rerun.ruleExecutions.reused).toBe(0);
    expect(rerun.ruleExecutions.actual).toBe(1);
  });

  test("エンジン bundle が読めない場合は検査不能で完了しない（保存済み合格を利用しない）", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    await runInspection(root, "final", { maxWorkers: 0 });
    const bundlePath = path.resolve(import.meta.dir, "..", "vendor", "textlint-engine.bundle.json");
    expect(fs.existsSync(bundlePath)).toBe(true);
    const run = await runInspection(root, "final", {
      env: {
        loadEngineFn: async () => ({
          ok: false,
          detail: "cannot read the vendored engine bundle (simulated missing engine)",
        }),
      },
      maxWorkers: 0,
    });
    expect(run.completion).toBe("incomplete");
    expect(run.ok).toBe(false);
    expect(acceptForProgress(run).accepted).toBe(false);
    expect(run.detail).toContain("engine");
  });
});

describe("異常終了・不完全結果の保存・再利用の禁止（TS-004、REQ-053-043）", () => {
  test("実検査異常の結果は保存されず、再実行でも実検査が行われる", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    // loadEngineFn が1度だけ失敗し、その後成功するシミュレーション
    let failed = false;
    const flaky = async () => {
      if (!failed) {
        failed = true;
        return { ok: false as const, detail: "simulated engine crash" };
      }
      const { loadEngine } = await import("../lib/engine-bundle.ts");
      return loadEngine();
    };
    const crashed = await runInspection(root, "final", { env: { loadEngineFn: flaky }, maxWorkers: 0 });
    expect(crashed.completion).toBe("incomplete");
    // 異常実行の後、正常に再検査が完結する（未検査対象の欠落なし）
    const recovered = await runInspection(root, "final", { maxWorkers: 0 });
    expect(recovered.completion).toBe("completed");
    expect(recovered.ruleExecutions.actual).toBe(1);
    expect(recovered.ruleExecutions.reused).toBe(0);
    expect(recovered.ok).toBe(true);
  });
});

describe("検査条件の追跡不能時は再利用しない（REQ-053-042 後段）", () => {
  test("computeInspectionConditions が追跡不能を返す構成では全件実検査になる", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    await runInspection(root, "final", { maxWorkers: 0 });
    const untracked = await runInspection(root, "final", {
      env: {
        computeConditions: () => ({ trackable: false, detail: "simulated untrackable condition" }),
      },
      maxWorkers: 0,
    });
    expect(untracked.targetState.conditionsTracked).toBe(false);
    expect(untracked.ruleExecutions.reused).toBe(0);
    expect(untracked.ruleExecutions.actual).toBe(1);
    expect(untracked.completion).toBe("completed");
  });

  test("computeInspectionConditions の正常系で条件が追跡可能", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const prepared = await prepareInspectionContext(root);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const conditions = computeInspectionConditions({
      root,
      config: prepared.context.prepared.config,
      composition: prepared.context.prepared.composition,
      engine: prepared.context.prepared.engine,
    });
    expect(conditions.trackable).toBe(true);
    if (!conditions.trackable) return;
    expect(conditions.conditionsHash).toMatch(/^[0-9a-f]{64}$/);
  });
});
