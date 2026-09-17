// ADF-COVERS(verification): REQ-012-047
//
// agentdev-traceability 配布スキル check の9種検査の検証（TS-007、DEC-030 決定6）。
// 不正な対応関係記述（inline + sidecar）、未知の成果物役割、存在しない要件への参照、
// 無効 artifact path、Design 対応の欠落、実装対応の欠落、検証対応の欠落、
// policy 不正、重複宣言の不整合の個別検出と positive/negative、
// Decision 欠落を不合格に計上しないこと、実行不能時に合格を返さないこと（TS-008）。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";import { join } from "node:path";
import { locateEvidence, scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";
import { currentRequirementLineIds } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/requirements.ts";
import { parseVerificationPolicy, resolveVerificationPolicyFromRoot } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/verification_scope.ts";
import { parseSidecar } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/sidecar.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-chk-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);
const KNOWN = ["REQ-900-001", "REQ-900-002", "REQ-900-003", "REQ-900-004"];

const MARKER = ["ADF", "-", "COVERS"].join("");

// フィクスチャ用の宣言行生成。テストソース内に完成形のマーカー文字列を直接
// 記述すると実リポジトリのコーパス走査で実宣言として誤検出されるため、
// マーカーはパーツ結合経由で組み立てる。
function decl(role: string, ids: string): string {
  return `<!-- ${MARKER}(${role}): ${ids} -->`;
}
function tsDecl(role: string, ids: string): string {
  return `// ${MARKER}(${role}): ${ids}`;
}

const DISTRIBUTION_BOUNDARY_FIXTURE =
  ".opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.test.ts";
const ESCAPED_FIXTURE_ID = ["REQ-", "\\\\", "u0030", "\\\\", "u0031"].join("");

function distributionBoundaryMalformedFixture(): string {
  // 正規宣言位置（行頭 // コメント）内に配置する。対象外判定導入後も
  // exemption 機能（file + 行テキスト断片の限定免除）を検証し続けるため。
  return `// text: "<!-- ${MARKER}(implementation): ${ESCAPED_FIXTURE_ID} -->",`;
}

// policy.yaml の fixture 書き込み。直前テストが policy.yaml をディレクトリ化して
// いる場合に備えて必ず除去してから書き込む。
function writePolicy(lines: readonly string[]): void {
  rmSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true, force: true });
  writeFixture("traceability/policy.yaml", lines);
}

function writeFixture(rel: string, lines: readonly string[]): void {
  const filePath = join(ROOT, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

beforeAll(() => {
  mkdirSync(ROOT, { recursive: true });
});
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("check の個別検出", () => {
  it("不正な対応宣言（コロンなし・ID 形式違反）を malformed-declarations で検出する", () => {
    writeFixture("bad/syntax.md", [
      `<!-- ${MARKER}(design) REQ-900-001 -->`,
      `<!-- ${MARKER}(design): REQ900-001 -->`,
    ]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    const check = report.checks["malformed-declarations"];
    expect(check.status).toBe("fail");
    expect(check.findings).toHaveLength(2);
    expect(check.findings.every((f) => f.file === "bad/syntax.md")).toBe(true);
  });

  it("未知の成果物役割を unknown-roles で検出する（AC-006）", () => {
    writeFixture("bad/role.md", [decl("review", "REQ-900-001")]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    expect(report.checks["unknown-roles"].status).toBe("fail");
    expect(report.checks["unknown-roles"].findings[0]?.file).toBe("bad/role.md");
  });

  it("存在しない要件への参照を unknown-req-refs で検出する（AC-006）", () => {
    writeFixture("bad/ref.ts", [tsDecl("implementation", "REQ-900-999")]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    const finding = report.checks["unknown-req-refs"].findings.find(
      (f) => f.file === "bad/ref.ts",
    );
    expect(finding?.reqId).toBe("REQ-900-999");
  });

  it("実装対応の欠落と検証対応の欠落を個別に検出する（AC-007）", () => {
    writeFixture("good/impl-only.ts", [tsDecl("implementation", "REQ-900-001")]);
    writeFixture("good/verif-only.ts", [tsDecl("verification", "REQ-900-002")]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN, { completenessReqIds: ["REQ-900-001", "REQ-900-002"] });
    expect(report.checks["missing-implementation"].status).toBe("fail");
    expect(report.checks["missing-implementation"].findings).toEqual([{ reqId: "REQ-900-002" }]);
    expect(report.checks["missing-verification"].status).toBe("fail");
    expect(report.checks["missing-verification"].findings).toEqual([{ reqId: "REQ-900-001" }]);
  });

  it("Design 対応の欠落を missing-design で検出する（negative: 1件以上あれば検出しない）", () => {
    // REQ-900-001 は Design 対応なし、REQ-900-002 は Design 対応あり
    writeFixture("good/impl.ts", [tsDecl("implementation", "REQ-900-001")]);
    writeFixture("good/design.md", [decl("design", "REQ-900-002")]);
    writeFixture("good/verify.ts", [tsDecl("verification", "REQ-900-001, REQ-900-002")]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN, { completenessReqIds: ["REQ-900-001", "REQ-900-002"] });
    expect(report.checks["missing-design"].status).toBe("fail");
    expect(report.checks["missing-design"].findings).toEqual([{ reqId: "REQ-900-001" }]);
    const positive = runChecks(scan, KNOWN, { completenessReqIds: ["REQ-900-002"] });
    expect(positive.checks["missing-design"].status).toBe("pass");
  });

  it("Decision 対応0件のみを理由に異常としない（REQ-012-028、REQ-012-036）", () => {
    writeFixture("clean/design.md", [decl("design", "REQ-900-003")]);
    writeFixture("clean/impl.ts", [tsDecl("implementation", "REQ-900-003")]);
    writeFixture("clean/test.test.ts", [tsDecl("verification", "REQ-900-003")]);
    const scan = scanCorpus(ROOT);
    expect(scan.declarations.some((d) => d.role === "decision")).toBe(false);
    const report = runChecks(scan, KNOWN, { completenessReqIds: ["REQ-900-003"] });
    expect(report.checks["missing-design"].status).toBe("pass");
    expect(report.checks["missing-implementation"].status).toBe("pass");
    expect(report.checks["missing-verification"].status).toBe("pass");
    // Decision 欠落を計上する検査項目は存在しない
    expect(Object.keys(report.checks).some((k) => k.toLowerCase().includes("decision"))).toBe(false);
  });

  it("存在しない成果物パスを invalid-artifact-paths で検出する", () => {
    const scan = scanCorpus(ROOT);
    const evidence = locateEvidence(ROOT, "not/found.md");
    expect(evidence.ok).toBe(false);
    if (!evidence.ok) {
      expect(evidence.reason).toBe("file-not-found");
    }
    const report = runChecks(scan, KNOWN, {
      evidenceArtifacts: [{ artifact: "not/found.md", reason: "file-not-found" }],
    });
    expect(report.checks["invalid-artifact-paths"].status).toBe("fail");
    expect(report.checks["invalid-artifact-paths"].findings[0]?.artifact).toBe("not/found.md");
  });

  it("sidecar が参照する不在 artifact を invalid-artifact-paths で検出する（TS-007）", () => {
    writeFixture("traceability/missing-target.yaml", [
      "component: missing-target",
      "implementation:",
      "  gone/no-such-file.ts:",
      "    - REQ-900-001",
    ]);
    writeFixture("gone/exists.ts", [`// ${MARKER}(implementation): REQ-900-001`]);
    const scan = scanCorpus(ROOT);
    expect(scan.sidecarMissingArtifacts).toEqual([
      { artifact: "gone/no-such-file.ts", sidecarFile: "traceability/missing-target.yaml" },
    ]);
    const report = runChecks(scan, KNOWN, { completenessReqIds: [] });
    const finding = report.checks["invalid-artifact-paths"].findings.find(
      (f) => f.artifact === "gone/no-such-file.ts",
    );
    expect(finding?.reason).toBe("sidecar-target-not-found");
    // sidecar 参照先が存在する場合（negative）は計上しない
    const scanOk = scanCorpus(ROOT);
    const okFindings = scanOk.sidecarMissingArtifacts.filter(
      (m) => m.artifact === "gone/exists.ts",
    );
    expect(okFindings).toEqual([]);
  });

  it("完全性検査の対象を completenessReqIds で限定できる", () => {
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN, { completenessReqIds: ["REQ-900-001"] });
    expect(report.completenessScope).toEqual(["REQ-900-001"]);
    // 限定対象外の要件は欠落検査に現れない
    const missing = [
      ...report.checks["missing-implementation"].findings,
      ...report.checks["missing-verification"].findings,
    ].map((f) => f.reqId);
    expect(missing.every((id) => id === "REQ-900-001")).toBe(true);
  });

  it("summary が pass / fail 件数を集計する", () => {
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    const total = Object.keys(report.checks).length;
    expect(report.summary.pass + report.summary.fail).toBe(total);
  });
});

describe("check の9種検査: policy 不正と重複不整合（TS-007）", () => {
  it("policy schema 違反（未知キー）を policy-invalid で検出する（negative: 正常 policy は pass）", () => {
    writePolicy([
      "verification:",
      "  default: required",
      "  unknown-key:",
      "    - REQ-900-001",
    ]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(resolved.unavailable).toBe(true);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: resolved });
    expect(report.checks["policy-invalid"].status).toBe("fail");
    expect(report.checks["policy-invalid"].findings[0]?.file).toBe("traceability/policy.yaml");
    writePolicy(["verification:", "  default: required"]);
    const ok = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    const okReport = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: ok });
    expect(okReport.checks["policy-invalid"].status).toBe("pass");
  });

  it("policy default 値不正と optional ID 形式違反を policy-invalid で検出する", () => {
    writePolicy(["verification:", "  default: optional", "  optional: [not-an-req-id]"]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(resolved.unavailable).toBe(true);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: resolved });
    expect(report.checks["policy-invalid"].status).toBe("fail");
    expect(report.checks["policy-invalid"].findings).toHaveLength(2);
  });

  it("policy 読取不能（ディレクトリ）を policy-invalid で検出し fail-closed とする", () => {
    rmSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true, force: true });
    mkdirSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true });
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(resolved.unavailable).toBe(true);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: resolved });
    expect(report.checks["policy-invalid"].status).toBe("fail");
    expect(report.checks["missing-verification"].status).toBe("fail");
  });

  it("同一論理関係の整合する重複（sidecar と inline が同一集合）は検出しない（TS-003）", () => {
    writeFixture("traceability/consistent.yaml", [
      "component: consistent",
      "implementation:",
      "  consistent/impl.ts:",
      "    - REQ-900-004",
    ]);
    writeFixture("consistent/impl.ts", [tsDecl("implementation", "REQ-900-004")]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN, { completenessReqIds: [] });
    expect(report.checks["duplicate-inconsistencies"].status).toBe("pass");
  });

  it("同一論理関係の矛盾する重複（sidecar と inline の集合不一致）を検出する（TS-007）", () => {
    writeFixture("traceability/inconsistent.yaml", [
      "component: inconsistent",
      "implementation:",
      "  inconsistent/impl.ts:",
      "    - REQ-900-001",
      "    - REQ-900-002",
    ]);
    writeFixture("inconsistent/impl.ts", [tsDecl("implementation", "REQ-900-001")]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN, { completenessReqIds: [] });
    expect(report.checks["duplicate-inconsistencies"].status).toBe("fail");
    expect(report.checks["duplicate-inconsistencies"].findings[0]?.artifact).toBe(
      "inconsistent/impl.ts",
    );
  });

  it("sidecar の構文不正・schema 不適合を malformed-declarations で検出する", () => {
    writeFixture("traceability/broken.yaml", ["component: [この構文は解析不能:", "  - x"]);
    writeFixture("traceability/bad-schema.yaml", [
      "component: bad-schema",
      "unknown-role-key:",
      "  a.ts:",
      "    - REQ-900-001",
    ]);
    const scan = scanCorpus(ROOT);
    expect(scan.sidecarIssues.some((i) => i.reason === "invalid-syntax")).toBe(true);
    expect(scan.sidecarIssues.some((i) => i.reason === "invalid-schema")).toBe(true);
    const report = runChecks(scan, KNOWN, { completenessReqIds: [] });
    expect(report.checks["malformed-declarations"].status).toBe("fail");
    expect(
      report.checks["malformed-declarations"].findings.some(
        (f) => f.file === "traceability/broken.yaml",
      ),
    ).toBe(true);
    expect(
      report.checks["malformed-declarations"].findings.some(
        (f) => f.file === "traceability/bad-schema.yaml",
      ),
    ).toBe(true);
  });
});

describe("check の fail-closed（TS-008、AC-14）", () => {
  it("policy の解決が実行不能な入力で対応完全性の合格を返さない", () => {
    // broken な sidecar は fail-closed の別経路（sidecar blocked）を誘発するため
    // policy 由来の blocked のみを検証できるよう除去する
    for (const rel of ["traceability/broken.yaml", "traceability/bad-schema.yaml"]) {
      rmSync(join(ROOT, rel), { recursive: true, force: true });
    }
    rmSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true, force: true });
    writeFixture("traceability/policy.yaml", ["component: [解析不能:", "  - x"]);
    writeFixture("failclosed/design.md", [decl("design", "REQ-900-001")]);
    writeFixture("failclosed/impl.ts", [tsDecl("implementation", "REQ-900-001")]);
    writeFixture("failclosed/verify.ts", [tsDecl("verification", "REQ-900-001")]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(resolved.unavailable).toBe(true);
    const report = runChecks(scanCorpus(ROOT), KNOWN, {
      verificationPolicy: resolved,
      completenessReqIds: ["REQ-900-001"],
    });
    expect(report.checks["missing-design"].status).toBe("pass");
    expect(report.checks["missing-implementation"].status).toBe("pass");
    // 完全性の要否判定が不能なため missing-verification は合格を返さない
    expect(report.checks["missing-verification"].status).toBe("fail");
    expect(report.verificationPolicyUnavailable).toBe(true);
  });

  it("sidecar の解析が実行不能な入力で missing-* の合格を返さない", () => {
    writeFixture("traceability/unparsable.yaml", ["::: not yaml :::"]);
    const scan = scanCorpus(ROOT);
    expect(scan.sidecarIssues.length).toBeGreaterThan(0);
    const report = runChecks(scan, KNOWN, { completenessReqIds: ["REQ-900-001"] });
    expect(report.checks["missing-design"].status).toBe("fail");
    expect(report.checks["missing-implementation"].status).toBe("fail");
    expect(report.checks["missing-verification"].status).toBe("fail");
    expect(
      report.checks["missing-design"].findings.some(
        (f) => f.reason === "sidecar-evaluation-blocked",
      ),
    ).toBe(true);
  });

  it("sidecar 不在・policy 不在の正常環境では fail-closed 計上を行わない（negative）", () => {
    // 先行テストが配置した broken な sidecar・policy を除去して正常環境を再現する
    for (const rel of [
      "traceability/broken.yaml",
      "traceability/bad-schema.yaml",
      "traceability/unparsable.yaml",
      "traceability/policy.yaml",
    ]) {
      rmSync(join(ROOT, rel), { recursive: true, force: true });
    }
    const scan = scanCorpus(ROOT);
    expect(scan.sidecarIssues).toEqual([]);
    const report = runChecks(scan, KNOWN, { completenessReqIds: [] });
    expect(
      report.checks["missing-design"].findings.some(
        (f) => f.reason === "sidecar-evaluation-blocked",
      ),
    ).toBe(false);
    expect(
      report.checks["missing-verification"].findings.some(
        (f) => f.reason === "policy-evaluation-unavailable",
      ),
    ).toBe(false);
    expect(report.verificationPolicyUnavailable).toBe(false);
  });
});

describe("check の policy optional 解決（REQ-012-030、TS-004 の check 結合面）", () => {
  it("policy optional 登録行の検証対応0件は計上せず、未登録行のみ計上する", () => {
    // 先行 fail-closed テストの broken sidecar を除去し、blocked 計上を防ぐ
    for (const rel of ["traceability/broken.yaml", "traceability/bad-schema.yaml", "traceability/unparsable.yaml"]) {
      rmSync(join(ROOT, rel), { recursive: true, force: true });
    }
    writePolicy([
      "verification:",
      "  default: required",
      "  optional:",
      "    - REQ-900-002",
    ]);
    writeFixture("opt/impl.ts", [tsDecl("implementation", "REQ-900-001, REQ-900-002")]);
    writeFixture("opt/verify.ts", [tsDecl("verification", "REQ-900-001")]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect([...resolved.optionalReqIds]).toEqual(["REQ-900-002"]);
    const report = runChecks(scanCorpus(ROOT), KNOWN, {
      verificationPolicy: resolved,
      completenessReqIds: ["REQ-900-001", "REQ-900-002"],
    });
    expect(report.checks["missing-verification"].findings).toEqual([]);
    expect(report.checks["missing-verification"].status).toBe("pass");
    // 未登録行のみ計上するケース
    writeFixture("opt2/impl.ts", [tsDecl("implementation", "REQ-900-004")]);
    const report2 = runChecks(scanCorpus(ROOT), KNOWN, {
      verificationPolicy: resolved,
      completenessReqIds: ["REQ-900-004"],
    });
    expect(report2.checks["missing-verification"].findings).toEqual([{ reqId: "REQ-900-004" }]);
  });

  it("policy 不在では全要件行が検証対応必須として計上され、実行時エラーで停止しない", () => {
    rmSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true, force: true });
    writeFixture("nopolicy/impl.ts", [tsDecl("implementation", "REQ-900-004")]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    expect(resolved.optionalReqIds.size).toBe(0);
    expect(resolved.issues).toEqual([]);
    expect(resolved.unavailable).toBe(false);
    const report = runChecks(scanCorpus(ROOT), KNOWN, {
      verificationPolicy: resolved,
      completenessReqIds: ["REQ-900-004"],
    });
    expect(report.checks["missing-verification"].findings).toEqual([{ reqId: "REQ-900-004" }]);
  });

  it("policy optional 列挙の存在しない要件行を unknown-req-refs で検出する", () => {
    writePolicy([
      "verification:",
      "  default: required",
      "  optional:",
      "    - REQ-900-995",
      "    - REQ-900-002",
    ]);
    const resolved = resolveVerificationPolicyFromRoot(ROOT, KNOWN);
    // 未知行は optional から除外され安全側 required のまま
    expect([...resolved.optionalReqIds]).toEqual(["REQ-900-002"]);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: resolved });
    expect(report.checks["unknown-req-refs"].status).toBe("fail");
    const policyRef = report.checks["unknown-req-refs"].findings.find(
      (f) => f.reqId === "REQ-900-995",
    );
    expect(policyRef?.file).toBe("traceability/policy.yaml");
  });
});

describe("sidecar の解析（parseSidecar 単体）", () => {
  it("最小データ（artifact パス、role、要件行 ID のみ）で対応関係を正規化する（TS-002）", () => {
    const parsed = parseSidecar(
      "traceability/minimal.yaml",
      ["component: minimal", "implementation:", "  src/min.ts:", "    - REQ-900-001"].join("\n"),
    );
    expect(parsed.issues).toEqual([]);
    expect(parsed.component).toBe("minimal");
    expect(parsed.relations).toEqual([
      { role: "implementation", artifact: "src/min.ts", reqIds: ["REQ-900-001"] },
    ]);
  });

  it("artifact パスを複数 role 配下へ重複させられる（同一 role 内重複は schema 違反対象）", () => {
    const parsed = parseSidecar(
      "traceability/multi-role.yaml",
      [
        "component: multi",
        "implementation:",
        "  src/dual.ts:",
        "    - REQ-900-001",
        "verification:",
        "  src/dual.ts:",
        "    - REQ-900-001",
      ].join("\n"),
    );
    expect(parsed.issues).toEqual([]);
    expect(parsed.relations).toHaveLength(2);
    const sameRole = parseSidecar(
      "traceability/dup-role.yaml",
      [
        "component: dup",
        "implementation:",
        "  src/dup.ts:",
        "    - REQ-900-001",
      ].join("\n"),
    );
    expect(sameRole.issues).toEqual([]);
  });
});

describe("既知の意図的 fixture の exemption", () => {
  it("distribution-boundary の fail-closed fixture を malformed-declarations に計上しない", () => {
    writeFixture(DISTRIBUTION_BOUNDARY_FIXTURE, [distributionBoundaryMalformedFixture()]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    const findings = report.checks["malformed-declarations"].findings.filter(
      (finding) => finding.file === DISTRIBUTION_BOUNDARY_FIXTURE,
    );
    expect(findings).toEqual([]);
  });

  it("同一ファイルの別 malformed 行は exemption されない", () => {
    writeFixture(DISTRIBUTION_BOUNDARY_FIXTURE, [
      distributionBoundaryMalformedFixture(),
      `// ${MARKER}(design) REQ-900-001`,
    ]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    const findings = report.checks["malformed-declarations"].findings.filter(
      (finding) => finding.file === DISTRIBUTION_BOUNDARY_FIXTURE,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]?.text).toContain(`${MARKER}(design) REQ-900-001`);
  });

  it("同じ escape 断片でも別ファイルは exemption されない", () => {
    // 対象外判定後も exemption 限定性を検証するため、正規宣言位置（行頭 // コメント）
    // を持つ TypeScript ファイルに配置する
    const otherFile = "other/distribution-fixture.ts";
    writeFixture(otherFile, [distributionBoundaryMalformedFixture()]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN);
    const findings = report.checks["malformed-declarations"].findings.filter(
      (finding) => finding.file === otherFile,
    );
    expect(findings).toHaveLength(1);
  });
});

describe("現行要件行の収集", () => {
  it("docs/requirements/REQ-{NNNN}.md の要件テーブル行を現行要件として収集する", () => {
    writeFixture("docs/requirements/REQ-901.md", [
      "---",
      "id: REQ-901",
      "---",
      "",
      "## 要件",
      "",
      "| ID | 要件 |",
      "|---|---|",
      "| REQ-901-001 | 例 |",
      "| REQ-901-002 | 例 |",
    ]);
    writeFixture("docs/requirements/retired/REQ-902.md", [
      "| ID | 要件 |",
      "|---|---|",
      "| REQ-902-001 | 廃止 |",
    ]);
    const ids = currentRequirementLineIds(ROOT);
    expect(ids).toContain("REQ-901-001");
    expect(ids).toContain("REQ-901-002");
    expect(ids).not.toContain("REQ-902-001"); // retired/ は対象外
  });
});
