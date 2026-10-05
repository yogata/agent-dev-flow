//
// TS-006: 用途決定と結果の機械確認 — 実経路での工程接続。
// 実際の工程スクリプト（case-run / case-close 等の担当スクリプト）が行う
// 用途決定、入口の起動、結果の完全消費、進行判定までを、CLI サブプロセス経由で検証する。
// 試験専用模擬判定ではなく、gate.ts の実 CLI と resolveInspectionPurpose / acceptForProgress の
// 実装を通す。

import { describe, expect, test, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { invalidateConfigCache } from "../lib/config.ts";
import { acceptForProgress, resolveInspectionPurpose } from "../lib/runs.ts";
import type { InspectionRunResult } from "../lib/runs.ts";

const CLEAN = "# 見出し\n\nこれは正常な文章である。\n";
const VIOLATING = "# 見出し\n\n半角カナ\uFF71\uFF72\uFF73が混入している。\n";

const PLUGIN_DIR = path.resolve(import.meta.dir, "..");
const GATE_PATH = path.join(PLUGIN_DIR, "gate.ts");

function makeProject(files: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-pipe-"));
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

/** 実経路: CLI サブプロセスで gate.ts を起動し、終了コードと JSON 結果を返す。 */
async function runGateCli(
  root: string,
  args: readonly string[],
): Promise<{ readonly exitCode: number; readonly stdout: string; readonly stderr: string }> {
  const proc = Bun.spawn({
    cmd: [process.execPath, "run", GATE_PATH, "--root", root, ...args],
    cwd: PLUGIN_DIR,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { exitCode, stdout, stderr };
}

describe("工程接続の実経路（TS-006）", () => {
  test("case-run の docs 変更時最終検査（final）: 用途決定 → 入口起動 → 結果完全消費 → 進行判定", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const purpose = resolveInspectionPurpose({ workflow: "case-run" });
    expect(purpose).toBe("final");
    const { exitCode, stdout } = await runGateCli(root, ["--purpose", "final", "--json"]);
    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout) as { ok: boolean; run: InspectionRunResult; inspectedFiles: number };
    expect(payload.run.purpose).toBe("final");
    expect(payload.run.startedInspection).toBe(true);
    expect(payload.run.targetScope.count).toBe(1);
    expect(payload.run.ruleExecutions).toEqual({ actual: 1, reused: 0 });
    expect(payload.inspectedFiles).toBe(1);
    const decision = acceptForProgress(payload.run);
    expect(decision.accepted).toBe(true);
    // 2回目は保存結果の再利用（工程は結果から機械的に確認できる）
    const second = await runGateCli(root, ["--purpose", "final", "--json"]);
    const secondPayload = JSON.parse(second.stdout) as { ok: boolean; run: InspectionRunResult };
    expect(secondPayload.run.ruleExecutions).toEqual({ actual: 0, reused: 1 });
    expect(acceptForProgress(secondPayload.run).accepted).toBe(true);
  });

  test("case-close の独立要求（independent）: 再利用数ゼロで全件実行され、独立要求を満たす", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    // final で保存済み結果を作った後でも、独立検査は再利用しない
    const finalPurpose = resolveInspectionPurpose({ workflow: "case-run" });
    await runGateCli(root, ["--purpose", finalPurpose, "--json"]);
    const purpose = resolveInspectionPurpose({ workflow: "case-close", requiresIndependentInspection: true });
    expect(purpose).toBe("independent");
    const { exitCode, stdout } = await runGateCli(root, ["--purpose", "independent", "--json"]);
    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout) as { run: InspectionRunResult };
    expect(payload.run.purpose).toBe("independent");
    expect(payload.run.ruleExecutions.reused).toBe(0);
    expect(payload.run.ruleExecutions.actual).toBe(1);
    expect(acceptForProgress(payload.run).accepted).toBe(true);
  });

  test("不合格の結果で進行が停止する（実経路）", async () => {
    const root = makeProject({ "docs/v.md": VIOLATING });
    const { exitCode, stdout } = await runGateCli(root, ["--purpose", "final", "--json"]);
    expect(exitCode).toBe(1);
    const payload = JSON.parse(stdout) as { ok: boolean; run: InspectionRunResult };
    expect(payload.ok).toBe(false);
    expect(payload.run.hardCount).toBeGreaterThan(0);
    expect(acceptForProgress(payload.run).accepted).toBe(false);
  });

  test("display の結果で進行が停止する（再表示だけで検査起動扱いにしない）", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    await runGateCli(root, ["--purpose", "final", "--json"]);
    const { exitCode, stdout } = await runGateCli(root, ["--purpose", "display", "--json"]);
    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout) as { ok: boolean; run: InspectionRunResult };
    expect(payload.run.purpose).toBe("display");
    expect(payload.run.startedInspection).toBe(false);
    expect(acceptForProgress(payload.run).accepted).toBe(false);
    expect(payload.ok).toBe(false);
  });

  test("開始・終了時照合の不一致（検査不能の模擬: 設定不正で入口が検査不能）で進行が停止する", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const configAbs = path.join(root, ".agentdev", "config", "plugins", "agentdev-textlint-guard.yaml");
    fs.mkdirSync(path.dirname(configAbs), { recursive: true });
    fs.writeFileSync(configAbs, "version: 9\n", "utf8");
    const { exitCode, stdout } = await runGateCli(root, ["--purpose", "final", "--json"]);
    expect(exitCode).toBe(1);
    const payload = JSON.parse(stdout) as { run: InspectionRunResult };
    expect(payload.run.completion).toBe("incomplete");
    expect(payload.run.detail).toContain("config");
    expect(acceptForProgress(payload.run).accepted).toBe(false);
  });
});
