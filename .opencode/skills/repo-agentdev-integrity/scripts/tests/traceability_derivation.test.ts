// agentdev-traceability 配布スキルの対応宣言導出機構の検証。
// 対応関係: REQ-012-060, REQ-012-061（sidecar 正規配置・traceability/agentdev-traceability.yaml）。
// 本テスト自体の verification 対応は、derivations.ts への import 実測から導出機構が
// 宣言する（inline・sidecar 宣言を書かない導出機構の自己適用。REQ-012-060）。
//
// - 導出規約（traceability/derivations.yaml）の解析、不活性境界、schema 不備の
//   fail-closed 報告（REQ-012-060）
// - import 実測と検証対象モジュールの手動対応宣言から、検証対応を決定的に導出する
//   （REQ-012-060）。導出根拠のないテストは導出しない
// - 導出結果と手動宣言の重複・矛盾を決定的に検出し、手動付与対象を検出対象に
//   しないこと（REQ-012-061）
// - 代表する変更（ファイル新設・改名）で、導入前に手動更新していた sidecar 行が
//   導入後は不要になること（REQ-012-060・AG-012 B3-6）
// - 対応宣言の存在だけを根拠に実現または検証の成立を推定しない原則の維持
//   （T-003、REQ-012-032・REQ-012-061）

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDerivationsConfig, resolveDerivationsFromRoot, deriveFromManualDeclarations } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/derivations.ts";
import { scanCorpus } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/check.ts";
import { resolveVerificationPolicyFromRoot } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/verification_scope.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-deriv-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);
const BARE_ROOT = join(TEMP_BASE, `${RUN_ID}-bare`);
const BROKEN_ROOT = join(TEMP_BASE, `${RUN_ID}-broken`);

const KNOWN = ["REQ-012-060", "REQ-012-061", "REQ-107-003"];

const TARGET_TS = [
  "// fixture 検証対象モジュール",
  "// ADF-COVERS(implementation): REQ-012-060, REQ-012-061",
  "export function target(): number {",
  "  return 1;",
  "}",
];

const DERIVED_TEST_TS = [
  "import { expect, test } from \"bun:test\";",
  "import { target } from \"../src/lib/target.ts\";",
  "test(\"target\", () => {",
  "  expect(target()).toBe(1);",
  "});",
];

const NOROOT_TEST_TS = [
  "import { expect, test } from \"bun:test\";",
  "import { other } from \"../src/lib/other.ts\";",
  "test(\"other\", () => {",
  "  expect(other()).toBe(2);",
  "});",
];

const DERIVATIONS_YAML = [
  "test-verifications:",
  "  tests-dirs:",
  "  - tests",
];

const MANUAL_SIDECAR_YAML = [
  "component: derivation-fixture",
  "verification:",
  "  tests/derived.test.ts:",
  "    - REQ-012-060",
  "    - REQ-107-003",
  "  src/lib/target.ts:",
  "    - REQ-012-061",
];

function writeFixture(base: string, rel: string, lines: readonly string[]): void {
  const filePath = join(base, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

beforeAll(() => {
  mkdirSync(ROOT, { recursive: true });
  mkdirSync(BARE_ROOT, { recursive: true });
  mkdirSync(BROKEN_ROOT, { recursive: true });
});

afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
  rmSync(BARE_ROOT, { recursive: true, force: true });
  rmSync(BROKEN_ROOT, { recursive: true, force: true });
});

describe("導出規約の解析と不活性境界（REQ-012-060）", () => {
  it("導出規約を解析する", () => {
    const parsed = parseDerivationsConfig("traceability/derivations.yaml", DERIVATIONS_YAML.join("\n"));
    expect(parsed.issues).toEqual([]);
    expect(parsed.config).toEqual({ testsDirs: ["tests"] });
  });

  it("未知のトップレベルキー・tests-dirs 不備を黙って読み飛ばさない", () => {
    const unknownKey = parseDerivationsConfig("traceability/derivations.yaml", [
      "test-verifications:",
      "  tests-dirs:",
      "  - tests",
      "unknown-key: x",
    ].join("\n"));
    expect(unknownKey.config).toBeUndefined();
    expect(unknownKey.issues.length).toBe(1);
    const emptyDirs = parseDerivationsConfig("traceability/derivations.yaml", "test-verifications:\n  tests-dirs: []\n");
    expect(emptyDirs.config).toBeUndefined();
    expect(emptyDirs.issues.length).toBe(1);
  });

  it("導出規約不在時は不活性（導出 0・issue 0）", () => {
    writeFixture(BARE_ROOT, "src/lib/target.ts", TARGET_TS);
    writeFixture(BARE_ROOT, "tests/derived.test.ts", DERIVED_TEST_TS);
    const resolved = resolveDerivationsFromRoot(BARE_ROOT);
    expect(resolved.available).toBe(false);
    expect(resolved.issues).toEqual([]);
    const scan = scanCorpus(BARE_ROOT);
    expect(scan.derivedDeclarations).toEqual([]);
    expect(scan.derivationIssues).toEqual([]);
  });

  it("規約の schema 不備を fail-closed で報告する", () => {
    writeFixture(BROKEN_ROOT, "traceability/derivations.yaml", [
      "unknown-top-level: x",
    ]);
    const resolved = resolveDerivationsFromRoot(BROKEN_ROOT);
    expect(resolved.available).toBe(true);
    expect(resolved.config).toBeUndefined();
    expect(resolved.issues.length).toBeGreaterThan(0);
    const scan = scanCorpus(BROKEN_ROOT);
    expect(scan.derivationIssues.length).toBeGreaterThan(0);
    const report = runChecks(scan, KNOWN);
    expect(report.checks["derived-declaration-conflicts"].status).toBe("fail");
  });
});

describe("import 実測からの検証対応導出（REQ-012-060）", () => {
  beforeAll(() => {
    writeFixture(ROOT, "traceability/derivations.yaml", DERIVATIONS_YAML);
    writeFixture(ROOT, "src/lib/target.ts", TARGET_TS);
    writeFixture(ROOT, "src/lib/other.ts", [
      "// 対応宣言を持たない fixture モジュール",
      "export function other(): number {",
      "  return 2;",
      "}",
    ]);
    writeFixture(ROOT, "tests/derived.test.ts", DERIVED_TEST_TS);
    writeFixture(ROOT, "tests/noroot.test.ts", NOROOT_TEST_TS);
  });

  it("検証対象モジュールの手動対応宣言から検証対応を導出する", () => {
    const scan = scanCorpus(ROOT);
    const manualOnly = scan.declarations.filter((d) => d.source !== "derived");
    const result = deriveFromManualDeclarations(ROOT, manualOnly);
    const derived = result.declarations.filter((d) => d.file === "tests/derived.test.ts");
    expect(derived).toHaveLength(1);
    expect(derived[0]!.role).toBe("verification");
    expect(derived[0]!.source).toBe("derived");
    expect(derived[0]!.reqIds).toEqual(["REQ-012-060", "REQ-012-061"]);
  });

  it("導出根拠のないテスト（import 先に対応宣言がない）は導出しない", () => {
    const scan = scanCorpus(ROOT);
    const manualOnly = scan.declarations.filter((d) => d.source !== "derived");
    const result = deriveFromManualDeclarations(ROOT, manualOnly);
    expect(result.declarations.some((d) => d.file === "tests/noroot.test.ts")).toBe(false);
  });

  it("導出根拠は手動宣言のみとし、導出宣言を根拠にしない", () => {
    const scan = scanCorpus(ROOT);
    const manualOnly = scan.declarations.filter((d) => d.source !== "derived");
    const result = deriveFromManualDeclarations(ROOT, manualOnly);
    const once = result.declarations.filter((d) => d.file === "tests/derived.test.ts");
    const again = deriveFromManualDeclarations(ROOT, [...manualOnly, ...once]).declarations.filter((d) => d.file === "tests/derived.test.ts");
    expect(again[0]!.reqIds).toEqual(once[0]!.reqIds);
  });

  it("scanCorpus が導出宣言を同一の論理対応関係へ正規化して統合する", () => {
    const scan = scanCorpus(ROOT);
    const derived = scan.declarations.filter((d) => d.source === "derived");
    expect(derived.some((d) => d.file === "tests/derived.test.ts")).toBe(true);
  });
});

describe("代表する変更の模擬：ファイル新設・改名で手動更新が不要になること（REQ-012-060）", () => {
  beforeAll(() => {
    writeFixture(ROOT, "traceability/derivations.yaml", DERIVATIONS_YAML);
    writeFixture(ROOT, "src/lib/target.ts", TARGET_TS);
    writeFixture(ROOT, "tests/derived.test.ts", DERIVED_TEST_TS);
  });

  it("ファイル新設: sidecar 行を手動追加しなくても導出が対応宣言を生成する", () => {
    // 導入前運用では、この新設テストの verification 対応を sidecar へ手動追加する
    // 必要があった。導出機構導入後は sidecar を一切更新せずに対応が成立する。
    writeFixture(ROOT, "tests/new-addition.test.ts", [
      "import { expect, test } from \"bun:test\";",
      "import { target } from \"../src/lib/target.ts\";",
      "test(\"new addition\", () => {",
      "  expect(target()).toBe(1);",
      "});",
    ]);
    const scan = scanCorpus(ROOT);
    const derived = scan.derivedDeclarations.filter((d) => d.file === "tests/new-addition.test.ts");
    expect(derived).toHaveLength(1);
    expect(derived[0]!.reqIds).toEqual(["REQ-012-060", "REQ-012-061"]);
  });

  it("ファイル改名: sidecar 行を手動修正しなくても導出が新パスへ追従する", () => {
    // 導入前運用では、改名時に sidecar の artifact パス行を手動修正する必要が
    // あった（修正漏れは invalid-artifact-paths として検出）。導出機構導入後は
    // sidecar を一切更新せずに導出が新パスへ追従する。
    const oldContent = readFileSync(join(ROOT, "tests/derived.test.ts"), "utf-8");
    rmSync(join(ROOT, "tests/derived.test.ts"));
    writeFileSync(join(ROOT, "tests/renamed-derived.test.ts"), oldContent, "utf-8");
    const scan = scanCorpus(ROOT);
    expect(scan.derivedDeclarations.some((d) => d.file === "tests/derived.test.ts")).toBe(false);
    const renamed = scan.derivedDeclarations.filter((d) => d.file === "tests/renamed-derived.test.ts");
    expect(renamed).toHaveLength(1);
    expect(renamed[0]!.reqIds).toEqual(["REQ-012-060", "REQ-012-061"]);
  });
});

describe("導出結果と手動宣言の重複・矛盾の決定的検出（REQ-012-061）", () => {
  beforeAll(() => {
    writeFixture(ROOT, "traceability/derivations.yaml", DERIVATIONS_YAML);
    writeFixture(ROOT, "src/lib/target.ts", TARGET_TS);
    writeFixture(ROOT, "tests/derived.test.ts", DERIVED_TEST_TS);
    writeFixture(ROOT, "traceability/manual-fixture.yaml", MANUAL_SIDECAR_YAML);
  });

  it("重複（導出と同一論理関係の手動残存）と矛盾（部分重複しつつ集合不一致）を検出する", () => {
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    const item = report.checks["derived-declaration-conflicts"];
    expect(item.status).toBe("fail");
    const duplicate = item.findings.find((f) => f.artifact === "tests/derived.test.ts" && f.reqId === "REQ-012-060");
    expect(duplicate).toBeDefined();
    expect(duplicate!.detail).toContain("重複");
    const contradiction = item.findings.find((f) => f.artifact === "tests/derived.test.ts" && (f.detail ?? "").includes("矛盾"));
    expect(contradiction).toBeDefined();
  });

  it("交差なしの共存（導出に含まれない要件行 ID のみの手動宣言）は手動付与対象として検出しない", () => {
    // 導出対象テストが導出に含まれない検証根拠（REQ-107-003 のみ）を手動宣言している
    // 状態は手動付与対象の正当な残存であり、矛盾として検出しない（REQ-012-060 の境界）。
    rmSync(join(ROOT, "traceability/manual-fixture.yaml"));
    writeFixture(ROOT, "traceability/manual-fixture.yaml", [
      "component: derivation-fixture",
      "verification:",
      "  tests/derived.test.ts:",
      "    - REQ-107-003",
      "  src/lib/target.ts:",
      "    - REQ-012-061",
    ]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    const findings = report.checks["derived-declaration-conflicts"].findings;
    expect(findings.some((f) => f.artifact === "tests/derived.test.ts")).toBe(false);
  });

  it("手動付与対象（導出対象外の論理関係）は検出対象にしない", () => {
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    const findings = report.checks["derived-declaration-conflicts"].findings;
    expect(findings.some((f) => f.artifact === "src/lib/target.ts")).toBe(false);
  });

  it("手動残存を導出へ移行すると重複・矛盾の検出が解消する", () => {
    rmSync(join(ROOT, "traceability/manual-fixture.yaml"));
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    expect(report.checks["derived-declaration-conflicts"].status).toBe("pass");
    expect(report.checks["derived-declaration-conflicts"].findings).toEqual([]);
  });
});

describe("T-003 の維持（REQ-012-032・REQ-012-061）", () => {
  beforeAll(() => {
    writeFixture(ROOT, "traceability/derivations.yaml", DERIVATIONS_YAML);
    writeFixture(ROOT, "src/lib/target.ts", TARGET_TS);
    writeFixture(ROOT, "tests/derived.test.ts", DERIVED_TEST_TS);
  });

  it("導出された対応宣言が存在しても、check は構造検査のみで意味的品質を合格としない", () => {
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    expect(scan.derivedDeclarations.length).toBeGreaterThan(0);
    expect(report.structuralOnly).toBe(true);
  });

  it("検証対応要否は導出せず policy が所有する（導出対象は対応宣言のみ）", () => {
    // policy.yaml が不在の fixture では、検証対応要否の判定は「未登録 = 必須」
    // の正規状態として解決される（REQ-012-051）。導出された verification 対応は
    // missing-verification の計上から該当行を外すが、要否の判定自体は policy が
    // 所有する。導出は対応宣言のみを提供し、要否を代行しないことの確認
    // （REQ-012-030・REQ-012-051・REQ-012-060）。
    const scan = scanCorpus(ROOT);
    const policy = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(policy.unavailable).toBe(false);
    const report = runChecks(scan, KNOWN, { verificationPolicy: policy });
    const missingVerification = report.checks["missing-verification"].findings.map((f) => f.reqId);
    expect(missingVerification).toEqual(["REQ-107-003"]);
  });
});
