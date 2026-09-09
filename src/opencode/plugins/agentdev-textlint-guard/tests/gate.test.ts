// ADF-COVERS(verification): REQ-053-031, REQ-053-032, REQ-053-033, REQ-010-075
// ADF-COVERS(verification): REQ-052-002
//
// TS-008: 二入口の同一性と bypass 検出。
// - 同じ全文、パス、規則と設定を pre-write と最終検査へ入力して比較する
// - 外部書込みで違反を導入して最終検査を実行する（bypass 検出）
// - 全対象の検査不能と拒否対象違反は完了失敗になる
// - 導入先で docs-check なしに実行できる（本テストは docs-check 非依存）

import { describe, expect, test, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { invalidateConfigCache, configPathFor } from "../lib/config.ts";
import { inspectAllTargetFiles, inspectText, prepareInspection } from "../lib/inspect.ts";
import { runFinalGate } from "../gate.ts";

const VIOLATING = "# 見出し\n\n半角カナ\uFF71\uFF72\uFF73が混入している。\n";
const CLEAN = "# 見出し\n\nこれは正常な文章である。\n";

function makeProject(files: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-gate-"));
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

describe("二入口の同一性（同一入力 → 同一判定）", () => {
  test("同じ全文・パス・規則・設定で pre-write と最終検査の判定差分はゼロ", async () => {
    const root = makeProject();
    const samples: Array<{ rel: string; text: string }> = [
      { rel: "docs/one.md", text: CLEAN },
      { rel: "docs/sub/two.md", text: VIOLATING },
      { rel: "docs/sub/three.md", text: "# 助言\n\nこれは重要かもしれません。\n" },
    ];
    // pre-write 経路の判定（共通基盤の inspectText を直接呼ぶ = plugin が使うのと同一関数）
    const prepared = await prepareInspection(root);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const preWrite = [];
    for (const s of samples) {
      const r = await inspectText(prepared, root, s.rel, s.text);
      expect(r.ok).toBe(true);
      if (r.ok) preWrite.push(r.result);
    }
    // 最終検査経路の判定（実ファイル全文）
    for (const s of samples) {
      const abs = path.join(root, ...s.rel.split("/"));
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, s.text, "utf8");
    }
    const gate = await inspectAllTargetFiles(root);
    expect(gate.ok).toBe(true);
    if (!gate.ok) return;
    expect(gate.outcome.files).toHaveLength(preWrite.length);
    const normalize = (f: { readonly path: string; readonly findings: readonly unknown[]; readonly hardCount: number }) =>
      JSON.stringify(f);
    const byPath = (a: { path: string }, b: { path: string }) => a.path.localeCompare(b.path);
    expect([...gate.outcome.files].sort(byPath).map(normalize)).toEqual([...preWrite].sort(byPath).map(normalize));
  });

  test("拒否件数の合計も一致する", async () => {
    const root = makeProject({ "docs/v.md": VIOLATING, "docs/c.md": CLEAN });
    const gate = await inspectAllTargetFiles(root);
    expect(gate.ok).toBe(true);
    if (!gate.ok) return;
    expect(gate.outcome.hardCount).toBeGreaterThan(0);
    // pre-write 経路で同じ全文を検査
    const prepared = await prepareInspection(root);
    if (!prepared.ok) return;
    const r = await inspectText(prepared, root, "docs/v.md", VIOLATING);
    expect(r.ok).toBe(true);
    const gateHard = gate.outcome.files.find((f) => f.path === "docs/v.md")?.hardCount ?? 0;
    if (r.ok) expect(r.result.hardCount).toBe(gateHard);
  });
});

describe("bypass 検出（外部書込み）", () => {
  test("フックを経由しない違反書込みを最終検査が不合格にする", async () => {
    const root = makeProject({ "docs/ok.md": CLEAN });
    // shell / 外部 editor 相当の直接書込み
    fs.writeFileSync(path.join(root, "docs", "bypass.md"), VIOLATING, "utf8");
    const gate = await runFinalGate(["--root", root]);
    expect(gate.exitCode).toBe(1);
    expect(gate.output).toContain("no-hankaku-kana");
    expect(gate.output).toContain("bypass.md");
    expect(gate.output).toContain("FAIL");
  });

  test("違反ゼロのときは合格する", async () => {
    const root = makeProject({ "docs/ok.md": CLEAN, "docs/ok2.md": "# 正常\n\n短い文。\n" });
    const gate = await runFinalGate(["--root", root]);
    expect(gate.exitCode).toBe(0);
    expect(gate.output).toContain("PASS");
  });

  test("検査不能は不合格（対象ファイル読取不能を除く通常経路では発生しない状態を作って確認）", async () => {
    // エンジン bundle が読めない状態は unit test で再現困難なため、
    // ここでは最終検査が「検査不能 = 不合格」であることを準備失敗経路で確認する:
    // 設定不正プロジェクトでは最終検査も不合格を返す。
    const root = makeProject({ "docs/a.md": CLEAN });
    const configAbs = configPathFor(root);
    fs.mkdirSync(path.dirname(configAbs), { recursive: true });
    fs.writeFileSync(configAbs, "version: 9\n", "utf8");
    const gate = await runFinalGate(["--root", root]);
    expect(gate.exitCode).toBe(1);
    expect(gate.output).toContain("FAIL");
    expect(gate.output).toContain("config");
  });

  test("追加対象も最終検査の全件列挙に入る", async () => {
    const root = makeProject({ "docs/a.md": CLEAN, "notes/n.md": VIOLATING });
    const configAbs = configPathFor(root);
    fs.mkdirSync(path.dirname(configAbs), { recursive: true });
    fs.writeFileSync(configAbs, "version: 1\nadditional_targets:\n  - notes/**/*.md\n", "utf8");
    const gate = await runFinalGate(["--root", root]);
    expect(gate.exitCode).toBe(1);
    expect(gate.output).toContain("notes/n.md");
  });

  test("pre-write 検査を経由しない変更の内、正常内容は合格扱い（差分・以前の結果に依存しない）", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    fs.writeFileSync(path.join(root, "docs", "direct.md"), "# 直接書込み\n\n正常な文章である。\n", "utf8");
    const gate = await runFinalGate(["--root", root]);
    expect(gate.exitCode).toBe(0);
  });
});

describe("final gate CLI 契約", () => {
  test("--json は構造化結果を返す", async () => {
    const root = makeProject({ "docs/v.md": VIOLATING });
    const gate = await runFinalGate(["--root", root, "--json"]);
    expect(gate.exitCode).toBe(1);
    const payload = JSON.parse(gate.output) as { ok: boolean; outcome: { hardCount: number } };
    expect(payload.ok).toBe(false);
    expect(payload.outcome.hardCount).toBeGreaterThan(0);
  });

  test("未知引数は終了コード 2", async () => {
    const gate = await runFinalGate(["--root", process.cwd(), "--bogus"]);
    expect(gate.exitCode).toBe(2);
  });

  test("pre-write と最終検査は docs-check に依存しない（import graph に docs-check 系を持たない）", async () => {
    const pluginSource = fs.readFileSync(path.join(import.meta.dir, "..", "plugin.ts"), "utf8");
    const gateSource = fs.readFileSync(path.join(import.meta.dir, "..", "gate.ts"), "utf8");
    for (const src of [pluginSource, gateSource]) {
      const importLines = src.split(/\r?\n/).filter((l) => l.startsWith("import"));
      expect(importLines.join("\n")).not.toContain("docs-check");
      expect(importLines.join("\n")).not.toContain("repo-agentdev-integrity");
    }
    // gate は独立して動作する（上記 runFinalGate の各テストが実行証拠）
  });
});

describe("corpus 適用（是正パターンでの二入口同一性と bypass 検出）", () => {
  const ADF_BODY_CONFIG =
    "version: 1\nadditional_targets:\n  - src/opencode/commands/**/*.md\n  - src/opencode/skills/**/*.md\n";
  // corpus 校正で是正した実在パターンの是正前後の全文（docs 標準対象と skills 追加対象の両方）。
  const CORPUS_CASES = [
    {
      rel: "docs/designs/commands/inspect-docs.md",
      before: "# 見出し\n\n- source-of-trought priority 遵守\n",
      after: "# 見出し\n\n- source-of-truth priority 遵守\n",
    },
    {
      rel: "src/opencode/skills/agentdev-intake-pipeline/references/intake-promotion.md",
      before: "# 見出し\n\nreject 時の commit message に却下理由を含める（監査証跠の補強）。\n",
      after: "# 見出し\n\nreject 時の commit message に却下理由を含める（監査証跡の補強）。\n",
    },
    {
      rel: "src/opencode/skills/agentdev-req-analysis/references/session-context-detection.md",
      before: "# 見出し\n\n推論結果を表示（**陈述形式、質問ではない**）。\n",
      after: "# 見出し\n\n推論結果を表示（**記述形式、質問ではない**）。\n",
    },
  ];

  function makeAdfProject(): string {
    const root = makeProject();
    const configAbs = configPathFor(root);
    fs.mkdirSync(path.dirname(configAbs), { recursive: true });
    fs.writeFileSync(configAbs, ADF_BODY_CONFIG, "utf8");
    return root;
  }

  test("是正前の全文は両入口で同一に拒否し、是正後の全文は両入口で同一に通過する", async () => {
    const root = makeAdfProject();
    const prepared = await prepareInspection(root);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    for (const c of CORPUS_CASES) {
      const abs = path.join(root, ...c.rel.split("/"));
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      // 是正前: pre-write 経路（plugin が使うのと同一の共通基盤入口）は拒否対象
      const beforePre = await inspectText(prepared, root, c.rel, c.before);
      expect(beforePre.ok).toBe(true);
      if (beforePre.ok) expect(beforePre.result.hardCount).toBeGreaterThan(0);
      // 是正前: 最終検査経路（実ファイル全文）も同一件数で拒否する
      fs.writeFileSync(abs, c.before, "utf8");
      const beforeGate = await inspectAllTargetFiles(root);
      expect(beforeGate.ok).toBe(true);
      if (!beforeGate.ok) return;
      const beforeFile = beforeGate.outcome.files.find((f) => f.path === c.rel);
      expect(beforeFile?.hardCount).toBeGreaterThan(0);
      if (beforePre.ok && beforeFile) expect(beforeFile.hardCount).toBe(beforePre.result.hardCount);
      // 是正後: 両入口とも拒否対象ゼロで同一に通過する
      const afterPre = await inspectText(prepared, root, c.rel, c.after);
      expect(afterPre.ok).toBe(true);
      if (afterPre.ok) expect(afterPre.result.hardCount).toBe(0);
      fs.writeFileSync(abs, c.after, "utf8");
      const afterGate = await inspectAllTargetFiles(root);
      expect(afterGate.ok).toBe(true);
      if (!afterGate.ok) return;
      const afterFile = afterGate.outcome.files.find((f) => f.path === c.rel);
      expect(afterFile?.hardCount).toBe(0);
    }
  });

  test("是正前パターンの外部書込み（bypass）を最終検査が検出する", async () => {
    const root = makeAdfProject();
    const abs = path.join(root, "src", "opencode", "skills", "agentdev-x", "references", "leaked.md");
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, CORPUS_CASES[0]?.before ?? VIOLATING, "utf8");
    const gate = await runFinalGate(["--root", root]);
    expect(gate.exitCode).toBe(1);
    expect(gate.output).toContain("leaked.md");
    expect(gate.output).toContain("prh");
    expect(gate.output).toContain("FAIL");
  });
});
