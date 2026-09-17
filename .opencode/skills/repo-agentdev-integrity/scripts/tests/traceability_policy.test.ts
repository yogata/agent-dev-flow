// ADF-COVERS(verification): REQ-012-030, REQ-012-047, REQ-012-051
//
// agentdev-traceability 配布スキルの検証スコープポリシー（traceability/policy.yaml）
// の解決検証（TS-004、旧検証対応要否カタログの廃止に伴う置換）。
// 未指定行 = required、明示登録行 = optional、policy 不在時は全行 required で
// 実行時エラーで停止しないこと、policy 構文不正・schema 不適合の検出、
// 要否判定不能時の fail-closed（unavailable）、optional 列挙の未知行の安全側除外、
// 未分類中間状態（classification）の不在を検証する。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";
import {
  DEFAULT_POLICY_FILE,
  parseVerificationPolicy,
  resolveVerificationPolicyFromRoot,
} from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/verification_scope.ts";
import { findRepoRoot } from "../cli_utils.ts";

const SCRIPT_DIR = import.meta.dir;
const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const CHECK_CLI = join(
  REPO_ROOT,
  "src",
  "opencode",
  "skills",
  "agentdev-traceability",
  "scripts",
  "src",
  "check.ts",
);

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-policy-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);

const MARKER = ["ADF", "-", "COVERS"].join("");

// フィクスチャ用の宣言行生成。テストソース内に完成形のマーカー文字列を直接
// 記述すると実リポジトリのコーパス走査で実宣言として誤検出されるため、
// マーカーはパーツ結合経由で組み立てる。
function tsDecl(role: string, ids: string): string {
  return `// ${MARKER}(${role}): ${ids}`;
}

function writeFixture(rel: string, lines: readonly string[]): void {
  const filePath = join(ROOT, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

function writePolicy(lines: readonly string[]): void {
  rmSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true, force: true });
  writeFixture("traceability/policy.yaml", lines);
}

function removePolicy(): void {
  rmSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true, force: true });
}

// 既知要件行: REQ-900-001..004, 006, 007（005 は欠番）。
const KNOWN: readonly string[] = [
  "REQ-900-001",
  "REQ-900-002",
  "REQ-900-003",
  "REQ-900-004",
  "REQ-900-006",
  "REQ-900-007",
];

function writeRequirements(): void {
  writeFixture("docs/requirements/REQ-900.md", [
    "| ID | 要件 |",
    "|---|---|",
    ...KNOWN.map((id) => `| ${id} | 例 |`),
  ]);
}

beforeAll(() => {
  mkdirSync(ROOT, { recursive: true });
  writeRequirements();
});
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("policy の解析（TS-004）", () => {
  it("未指定行は required、明示登録行は optional と判定される", () => {
    writePolicy([
      "verification:",
      "  default: required",
      "  optional:",
      "    - REQ-900-002",
      "    - REQ-900-003",
    ]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(resolved.issues).toEqual([]);
    expect(resolved.unavailable).toBe(false);
    expect([...resolved.optionalReqIds].sort()).toEqual(["REQ-900-002", "REQ-900-003"]);
    // 未指定行（REQ-900-001）は optional 集合に含まれない = required
    expect(resolved.optionalReqIds.has("REQ-900-001")).toBe(false);
  });

  it("default 省略は required として受理する", () => {
    writePolicy(["verification:", "  optional:", "    - REQ-900-004"]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(resolved.issues).toEqual([]);
    expect(resolved.unavailable).toBe(false);
    expect([...resolved.optionalReqIds]).toEqual(["REQ-900-004"]);
  });

  it("policy 構文不正は invalid-syntax として検出される", () => {
    const parsed = parseVerificationPolicy("component: [この構文は解析不能:", "  - x");
    expect(parsed.unavailable).toBe(true);
    expect(parsed.issues[0]?.reason).toBe("invalid-syntax");
  });

  it("schema 違反（未知キー・default 値不正・optional 形式違反）を検出する", () => {
    const parsed = parseVerificationPolicy(
      [
        "verification:",
        "  default: optional",
        "  unknown-key: true",
        "  optional:",
        "    - not-an-req-id",
      ].join("\n"),
    );
    expect(parsed.unavailable).toBe(true);
    expect(parsed.issues.map((i) => i.reason)).toEqual([
      "invalid-schema",
      "invalid-schema",
      "invalid-schema",
    ]);
    expect(parsed.optionalReqIds.size).toBe(0);
  });

  it("トップレベルがマッピングでない場合は schema 違反", () => {
    const parsed = parseVerificationPolicy("- a\n- b\n");
    expect(parsed.unavailable).toBe(true);
    expect(parsed.issues[0]?.reason).toBe("invalid-schema");
  });
});

describe("policy 不在時の安全側既定（TS-004）", () => {
  it("policy.yaml が存在しないプロジェクトでは全要件行が required として扱われ停止しない", () => {
    removePolicy();
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(resolved.optionalReqIds.size).toBe(0);
    expect(resolved.issues).toEqual([]);
    expect(resolved.unavailable).toBe(false);
    expect(resolved.policyFile).toBe(DEFAULT_POLICY_FILE);
  });
});

describe("optional 列挙の未知行（REQ-012-047 の policy 面）", () => {
  it("存在しない要件行は unknown-req-ref を報告し optional から除外する（安全側 required）", () => {
    writePolicy(["verification:", "  optional:", "    - REQ-900-999", "    - REQ-900-006"]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect([...resolved.optionalReqIds]).toEqual(["REQ-900-006"]);
    expect(resolved.issues).toEqual([
      {
        reason: "unknown-req-ref",
        reqId: "REQ-900-999",
        text: "REQ-900-999",
        detail: "policy.yaml の optional 列挙が参照する要件行が現行要件として存在しない",
      },
    ]);
    // 判定自体は継続可能のため unavailable にはしない
    expect(resolved.unavailable).toBe(false);
  });
});

describe("policy 解決と check の結合（fail-closed 面）", () => {
  it("policy 読取不能時は unavailable となり missing-verification が合格を返さない", () => {
    // policy.yaml をディレクトリ化して読取不能を再現する
    removePolicy();
    mkdirSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true });
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(resolved.unavailable).toBe(true);
    expect(resolved.issues[0]?.reason).toBe("unreadable-policy");
    // 実装・検証対応は充足しているが、要否判定不能のため合格を返さない（AC-14）
    writeFixture("complete/impl.ts", [tsDecl("implementation", KNOWN.join(", "))]);
    writeFixture("complete/design.md", [
      `<!-- ${MARKER}(design): ${KNOWN.join(", ")} -->`,
    ]);
    writeFixture("complete/verify.ts", [tsDecl("verification", KNOWN.join(", "))]);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: resolved });
    expect(report.checks["missing-design"].status).toBe("pass");
    expect(report.checks["missing-implementation"].status).toBe("pass");
    expect(report.checks["missing-verification"].status).toBe("fail");
    expect(report.verificationPolicyUnavailable).toBe(true);
  });

  it("policy optional 登録行は missing-verification の計上から除外される", () => {
    // 先行 fail-closed テストの全行充足 fixture（complete/*）を除去する
    for (const rel of [
      "complete/impl.ts",
      "complete/design.md",
      "complete/verify.ts",
    ]) {
      rmSync(join(ROOT, rel), { recursive: true, force: true });
    }
    writePolicy([
      "verification:",
      "  optional:",
      "    - REQ-900-002",
      "    - REQ-900-003",
      "    - REQ-900-004",
    ]);
    // 001: 実装+検証 / 002: 実装のみ（登録行）/ 003: 検証のみ（登録行）/
    // 004: 実装のみ（登録行）/ 006: 実装+検証 / 007: 実装のみ（未登録行）
    writeFixture("opt/a.ts", [tsDecl("implementation", "REQ-900-001, REQ-900-002, REQ-900-007")]);
    writeFixture("opt/b.ts", [tsDecl("verification", "REQ-900-001, REQ-900-003, REQ-900-006")]);
    writeFixture("opt/c.ts", [tsDecl("design", "REQ-900-001, REQ-900-002, REQ-900-003, REQ-900-006, REQ-900-007")]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: resolved });
    expect(report.checks["missing-verification"].findings).toEqual([{ reqId: "REQ-900-007" }]);
    expect(report.checks["missing-implementation"].findings).toEqual([
      { reqId: "REQ-900-003" },
      { reqId: "REQ-900-004" },
      { reqId: "REQ-900-006" },
    ]);
  });

  it("check CLI が policy.yaml を自動読込し、不在時は全行 required で動作する", () => {
    // 先行テストの宣言を除去し、検証対応0件の行を再現する
    for (const rel of ["opt/a.ts", "opt/b.ts", "opt/c.ts"]) {
      rmSync(join(ROOT, rel), { recursive: true, force: true });
    }
    writePolicy(["verification:", "  optional:", "    - REQ-900-002"]);
    removePolicy();
    // CLI 実行時点で policy は不在（全行 required）
    const proc = Bun.spawnSync(["bun", "run", CHECK_CLI, "--root", ROOT], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const report = JSON.parse(proc.stdout!.toString("utf-8")) as {
      checks: Record<string, { status: string; findings: { reqId?: string }[] }>;
      verificationPolicyUnavailable: boolean;
      summary: { pass: number; fail: number };
    };
    expect(report.checks["policy-invalid"]!.status).toBe("pass");
    expect(report.verificationPolicyUnavailable).toBe(false);
    // 全行 required のため検証対応0件の行は計上される
    const missingVerification = report.checks["missing-verification"]!.findings
      .map((f) => f.reqId)
      .sort();
    expect(missingVerification).toContain("REQ-900-002");
    expect(missingVerification).toContain("REQ-900-007");
    expect(proc.exitCode).toBe(2);
  });
});

describe("旧カタログ機構の不在（RA-002）", () => {
  it("旧検証対応要否カタログ（verification-scope-catalog.md）を参照する解決器は存在しない", () => {
    const libDir = join(
      REPO_ROOT,
      "src",
      "opencode",
      "skills",
      "agentdev-traceability",
      "scripts",
      "lib",
    );
    const scopeSource = readFileSync(join(libDir, "verification_scope.ts"), "utf-8");
    expect(scopeSource.includes("verification-scope-catalog")).toBe(false);
    expect(scopeSource.includes("任意行エントリ")).toBe(false);
    expect(existsSync(join(libDir, "classification.ts"))).toBe(false);
  });

  it("未分類中間状態を導出する分類モデルは存在しない（REQ-012-051）", () => {
    const checkSource = readFileSync(
      join(
        REPO_ROOT,
        "src",
        "opencode",
        "skills",
        "agentdev-traceability",
        "scripts",
        "lib",
        "check.ts",
      ),
      "utf-8",
    );
    expect(checkSource.includes("unclassified")).toBe(false);
    expect(checkSource.includes("verificationClassification")).toBe(false);
  });
});
