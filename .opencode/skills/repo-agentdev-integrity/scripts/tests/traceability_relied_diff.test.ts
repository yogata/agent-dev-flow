// ADF-COVERS(verification): REQ-106-001, REQ-106-002, REQ-106-003, REQ-106-004, REQ-106-005, REQ-106-006, REQ-106-007, REQ-106-008, REQ-106-009
//
// agentdev-traceability 配布スキル relied-diff（依拠版に基づく差分・変更影響・増分更新）の
// 公開契約検証（REQ-106、agentdev-traceability Design「impact 拡張（差分候補）」節）。
// 分類決定表（update / up-to-date / create / unverified）、変更起点の後続伝播
// （正味差分ゼロでも中間変更を後続へ引き継ぐ）、個別工程確定と全体反映完了の分離判定、
// 再利用証拠の上流整合確認を、テンポラリ git リポジトリの実 Git 事実で検証する。
// relied-diff は対応宣言走査に依存しないため、テンポラリリポジトリに対応宣言を配置しない
// （明示対応が空でも Git 事実から影響候補を返す構造の検証を兼ねる）。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  classifyDownstream,
  classifyEvidenceIntegration,
  classifyPathImpact,
  judgePropagationCompletion,
} from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/relied_diff.ts";
import type { PathGitFacts } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/relied_diff.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-relied-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);
const RELIED_DIFF_CLI = join(
  "src",
  "common",
  "skills",
  "agentdev-traceability",
  "scripts",
  "src",
  "relied-diff.ts",
);

const UPSTREAM = "upstream/u.md";
const DOWNSTREAM_EXISTING = "down/d.md";

function git(args: readonly string[]): string {
  return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf-8" });
}

function commitFile(rel: string, content: string, message: string): string {
  const filePath = join(ROOT, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, content + "\n", "utf-8");
  execFileSync("git", ["-C", ROOT, "add", "."], { encoding: "utf-8" });
  execFileSync("git", ["-C", ROOT, "commit", "-m", message], { encoding: "utf-8" });
  return git(["rev-parse", "HEAD"]).trim();
}

function runCli(args: readonly string[]): { stdout: string; exitCode: number } {
  const proc = Bun.spawnSync(["bun", RELIED_DIFF_CLI, "--root", ROOT, ...args], {
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    stdout: proc.stdout.toString(),
    exitCode: proc.exitCode ?? -1,
  };
}

let commitA = "";
let commitB = "";
let commitC = "";
let commitD = "";

beforeAll(() => {
  mkdirSync(ROOT, { recursive: true });
  execFileSync("git", ["-C", ROOT, "init"], { encoding: "utf-8" });
  git(["config", "user.name", "test"]);
  git(["config", "user.email", "test@example.invalid"]);
  git(["config", "commit.gpgsign", "false"]);
  git(["config", "core.autocrlf", "false"]);
  // c1=A: 上流 v1 と既存下流 d1 を同一コミットに含める（A..C の正味差分を u.md に限定）。
  // c2=B: 中間で上流 v2。c3=C: 上流を v1 へ戻す（A と正味同値）。
  // c4=D: 上流 v3 と新規上流 n.md。
  const downExisting = join(ROOT, DOWNSTREAM_EXISTING);
  mkdirSync(join(downExisting, ".."), { recursive: true });
  writeFileSync(downExisting, "d1\n", "utf-8");
  commitA = commitFile(UPSTREAM, "v1", "A");
  commitB = commitFile(UPSTREAM, "v2", "B intermediate");
  commitC = commitFile(UPSTREAM, "v1", "C revert");
  commitD = commitFile("upstream/n.md", "new", "D new upstream");
  commitFile(UPSTREAM, "v3", "D upstream v3");
});

afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("relied-diff CLI（依拠版指定）", () => {
  it("AC01: 依拠版を明示指定すると、工程開始タグを仮定せずその依拠版との差分候補を取得する", () => {
    const { stdout, exitCode } = runCli(["--relied", commitB]);
    expect(exitCode).toBe(0);
    const report = JSON.parse(stdout);
    expect(report.mode).toBe("relied-diff");
    expect(report.reliedCommit).toBe(commitB);
    expect(report.comparisonRange).toContain(commitB.slice(0, 12));
    const u = report.impacts.find((i: { path: string }) => i.path === UPSTREAM);
    expect(u.classification).toBe("update");
    expect(u.reliedBlob).not.toBe(u.headBlob);
  });

  it("AC02: 下流成果物が不在の新規作成では、存在しない旧下流との比較を要求せず create を返す", () => {
    const { stdout } = runCli(["--relied", commitA, "--downstream", "down/d2.md"]);
    const report = JSON.parse(stdout);
    expect(report.downstream.exists).toBe(false);
    expect(report.downstream.classification).toBe("create");
    expect(report.downstream.basis).toContain("比較を要求しない");
  });

  it("AC03: 依拠版を特定できない場合は unverified レポートを返し、影響なし・完了の判定を出さない", () => {
    const { stdout } = runCli(["--paths", UPSTREAM]);
    const report = JSON.parse(stdout);
    expect(report.reliedCommit).toBe(null);
    expect(report.fullyPropagated).toBe("undetermined");
    expect(report.impacts).toHaveLength(0);
    expect(report.note).toContain("影響なし」や「完了」と判定しない");
    const serialized = JSON.stringify(report);
    expect(serialized).not.toMatch(/"(impactNone|noImpact|proved|completed)"\s*:\s*true/);
  });

  it("AC03: 指定した依拠版が解決不能な場合も unverified レポートを返す", () => {
    const { stdout } = runCli(["--relied", "no-such-ref-exists", "--paths", UPSTREAM]);
    const report = JSON.parse(stdout);
    expect(report.reliedCommit).toBe(null);
    expect(report.fullyPropagated).toBe("undetermined");
  });

  it("AC04: 正味差分ゼロでも中間変更があれば、変更起点を後続へ引き継ぐ（propagationRequired）", () => {
    const { stdout } = runCli(["--relied", commitA, "--head", commitC, "--paths", UPSTREAM]);
    const report = JSON.parse(stdout);
    const u = report.impacts.find((i: { path: string }) => i.path === UPSTREAM);
    expect(u.classification).toBe("up-to-date");
    expect(u.reliedBlob).toBe(u.headBlob);
    expect(u.intermediateTouched).toBe(true);
    expect(u.propagationRequired).toBe(true);
    expect(u.basis).toContain("後続工程へ引き継ぐ");
  });

  it("AC05: 正味差分ゼロでも、中間版に依拠する下流への影響を無条件に除外しない", () => {
    // A→C は正味差分ゼロだが、中間版 B（v2）に依拠した下流に対する C（v1）は内容差分がある。
    const { stdout } = runCli(["--relied", commitB, "--head", commitC]);
    const report = JSON.parse(stdout);
    const u = report.impacts.find((i: { path: string }) => i.path === UPSTREAM);
    expect(u.classification).toBe("update");
    expect(u.reliedBlob).not.toBe(u.headBlob);
  });

  it("AC06: 対応宣言が空でも、Git 変更事実から影響候補を返す（無影響の証明と扱わない）", () => {
    // テンポラリリポジトリには対応宣言を配置していない。それでも候補が返る。
    const { stdout } = runCli(["--relied", commitA]);
    const report = JSON.parse(stdout);
    const paths = report.impacts.map((i: { path: string }) => i.path);
    expect(paths).toContain(UPSTREAM);
    expect(paths).toContain("upstream/n.md");
  });

  it("AC07: 影響候補ごとに4区分の分類と根拠（basis）が確認できる", () => {
    const { stdout } = runCli(["--relied", commitA]);
    const report = JSON.parse(stdout);
    for (const impact of report.impacts) {
      expect(["update", "up-to-date", "create", "unverified"]).toContain(impact.classification);
      expect(impact.basis.length).toBeGreaterThan(0);
    }
    // n.md は依拠版 A に存在しない新規上流 → unverified。
    const n = report.impacts.find((i: { path: string }) => i.path === "upstream/n.md");
    expect(n.classification).toBe("unverified");
    // HEAD で内容差分のある u.md → update。
    const u = report.impacts.find((i: { path: string }) => i.path === UPSTREAM);
    expect(u.classification).toBe("update");
  });

  it("AC08: 証拠対象版を指定すると再利用証拠の上流整合を確認し、未指定は unconfirmed を返す", () => {
    // 証拠対象版 C（u.md=v1）に対して現行 HEAD（u.md=v3）は内容差分 → stale（再検証要求）。
    const staleRun = JSON.parse(runCli(["--relied", commitA, "--evidence-basis", commitC]).stdout);
    expect(staleRun.evidence.status).toBe("stale");
    expect(staleRun.evidence.stalePaths).toContain(UPSTREAM);
    expect(staleRun.evidence.note).toContain("合格としない");
    const unconfirmedRun = JSON.parse(runCli(["--relied", commitA]).stdout);
    expect(unconfirmedRun.evidence.status).toBe("unconfirmed");
    expect(unconfirmedRun.evidence.note).toContain("整合は未確認");
  });

  it("AC09: 個別候補の分類と全体反映完了判定が別出力であり、確定と反映完了を別に判定できる", () => {
    // up-to-date のみ → 全反映完了（yes）。
    const yesRun = JSON.parse(
      runCli(["--relied", commitA, "--head", commitC, "--paths", UPSTREAM]).stdout,
    );
    expect(yesRun.impacts[0].classification).toBe("up-to-date");
    expect(yesRun.fullyPropagated).toBe("yes");
    // update 必要あり → no。
    const noRun = JSON.parse(runCli(["--relied", commitB, "--head", commitC]).stdout);
    expect(noRun.impacts[0].classification).toBe("update");
    expect(noRun.fullyPropagated).toBe("no");
    // unverified あり → 判定不能（undetermined）。
    const undeterminedRun = JSON.parse(runCli(["--relied", commitA]).stdout);
    const hasUnverified = undeterminedRun.impacts.some(
      (i: { classification: string }) => i.classification === "unverified",
    );
    expect(hasUnverified).toBe(true);
    expect(undeterminedRun.fullyPropagated).toBe("undetermined");
    // 下流作成が必要な場合も反映完了ではない。
    const createRun = JSON.parse(
      runCli(["--relied", commitA, "--head", commitC, "--paths", UPSTREAM, "--downstream", "down/absent.md"])
        .stdout,
    );
    expect(createRun.downstream.classification).toBe("create");
    expect(createRun.fullyPropagated).toBe("no");
  });
});

describe("classifyPathImpact（分類決定表・純関数）", () => {
  const facts = (over: Partial<PathGitFacts>): PathGitFacts => ({
    path: "p.md",
    reliedBlob: "a".repeat(40),
    headBlob: "b".repeat(40),
    intermediateTouched: false,
    changeKind: "modified",
    ...over,
  });

  it("依拠版に存在しない新規上流は unverified とする", () => {
    const result = classifyPathImpact(facts({ reliedBlob: null, changeKind: "added" }));
    expect(result?.classification).toBe("unverified");
    expect(result?.propagationRequired).toBe(false);
  });

  it("現行版で削除された上流は update とする（旧版から読み現行走査だけで落とさない）", () => {
    const result = classifyPathImpact(
      facts({ headBlob: null, changeKind: "deleted", intermediateTouched: true }),
    );
    expect(result?.classification).toBe("update");
    expect(result?.propagationRequired).toBe(true);
  });

  it("blob 同一かつ中間変更なしは up-to-date（propagationRequired false）", () => {
    const result = classifyPathImpact(facts({ headBlob: "a".repeat(40) }));
    expect(result?.classification).toBe("up-to-date");
    expect(result?.propagationRequired).toBe(false);
  });

  it("blob 同一でも中間変更ありは up-to-date + 伝播対象（AC04・AC05）", () => {
    const result = classifyPathImpact(
      facts({ headBlob: "a".repeat(40), intermediateTouched: true }),
    );
    expect(result?.classification).toBe("up-to-date");
    expect(result?.propagationRequired).toBe(true);
  });

  it("blob 異なる内容差分は update", () => {
    const result = classifyPathImpact(facts({}));
    expect(result?.classification).toBe("update");
  });

  it("両版とも不在のパスは候補から除外する", () => {
    const result = classifyPathImpact(facts({ reliedBlob: null, headBlob: null }));
    expect(result).toBe(null);
  });
});

describe("純関数（downstream・evidence・反映完了判定）", () => {
  it("classifyDownstream: 不在下流は create、旧下流との比較を要求しない", () => {
    const absent = classifyDownstream("d/x.md", null);
    expect(absent.classification).toBe("create");
    expect(absent.basis).toContain("比較を要求しない");
    const present = classifyDownstream("d/x.md", "a".repeat(40));
    expect(present.exists).toBe(true);
    expect(present.classification).toBe(null);
  });

  it("classifyEvidenceIntegration: 証拠対象版未解決は unconfirmed（合格の根拠にしない）", () => {
    const result = classifyEvidenceIntegration([], false);
    expect(result.status).toBe("unconfirmed");
    expect(result.stalePaths).toHaveLength(0);
    expect(result.note).toContain("合格としない");
  });

  it("judgePropagationCompletion: update/create は no、unverified は undetermined、up-to-date のみは yes", () => {
    const upToDate = { classification: "up-to-date" } as never;
    const update = { classification: "update" } as never;
    const unverified = { classification: "unverified" } as never;
    expect(judgePropagationCompletion([upToDate], null)).toBe("yes");
    expect(judgePropagationCompletion([update], null)).toBe("no");
    expect(judgePropagationCompletion([unverified], null)).toBe("undetermined");
    expect(judgePropagationCompletion([upToDate], { classification: "create" } as never)).toBe("no");
  });
});
