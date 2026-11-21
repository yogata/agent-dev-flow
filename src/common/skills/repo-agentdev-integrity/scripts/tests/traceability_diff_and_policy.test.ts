// ADF-COVERS(verification): REQ-012-030, REQ-012-045, REQ-012-046, REQ-012-047, REQ-012-051
//
// agentdev-traceability 配布スキルの差分影響判定・ポリシー違反検知・カバレッジ算出の
// 統合検証。check の不正な対応関係記述（inline + sidecar）・未知の成果物役割・存在しない
// 要件への参照・無効 artifact path・Design・実装・検証対応の欠落・重複宣言の不整合の
// 個別検出と positive/negative、検証スコープポリシー（traceability/policy.yaml）の解決、
// relied-diff（依拠版に基づく差分・変更影響・増分更新）の公開契約、impact / coverage の
// 公開契約を検証する。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { locateEvidence, scanCorpus } from "../../../../skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../skills/agentdev-traceability/scripts/lib/check.ts";
import { coverageByArtifact, coverageByRequirement, impactByArtifact, impactByRequirement } from "../../../../skills/agentdev-traceability/scripts/lib/query.ts";
import { currentRequirementLineIds } from "../../../../skills/agentdev-traceability/scripts/lib/requirements.ts";
import {
  classifyDownstream,
  classifyEvidenceIntegration,
  classifyPathImpact,
  judgePropagationCompletion,
  listTouchedPaths,
} from "../../../../skills/agentdev-traceability/scripts/lib/relied_diff.ts";
import type { PathGitFacts } from "../../../../skills/agentdev-traceability/scripts/lib/relied_diff.ts";
import {
  DEFAULT_POLICY_FILE,
  parseVerificationPolicy,
  resolveVerificationPolicyFromRoot,
} from "../../../../skills/agentdev-traceability/scripts/lib/verification_scope.ts";
import { findRepoRoot } from "../../lib/cli_utils.ts";

describe("check の個別検出と9種検査", () => {
  // check の検証（TS-007、DEC-030 決定6）。
  // 不正な対応関係記述（inline + sidecar）、未知の成果物役割、存在しない要件への参照、
  // 無効 artifact path、Design・実装・検証対応の欠落、重複宣言の不整合の個別検出と
  // positive/negative、Decision 欠落を不合格に計上しないこと、実行不能時に合格を返さない
  // こと（TS-008）。policy 解決（optional 区分・軸拡張）は本ファイルの policy セクションで
  // 実施する。

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
    "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/distribution-boundary.test.ts";
  const ESCAPED_FIXTURE_ID = ["REQ-", "\\\\", "u0030", "\\\\", "u0031"].join("");

  function distributionBoundaryMalformedFixture(): string {
    // 正規宣言位置（行頭 // コメント）内に配置する。対象外判定導入後も
    // exemption 機能（file + 行テキスト断片の限定免除）を検証し続けるため。
    return `// text: "<!-- ${MARKER}(implementation): ${ESCAPED_FIXTURE_ID} -->",`;
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

  describe("check の9種検査: 重複不整合と sidecar 構文不正（TS-007）", () => {
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
      const ids = currentRequirementLineIds(ROOT);
      expect(ids).toContain("REQ-901-001");
      expect(ids).toContain("REQ-901-002");
    });
  });
});

describe("検証スコープポリシー（policy）", () => {
  // 検証スコープポリシー（traceability/policy.yaml）の解決検証（TS-004、旧検証対応要否
  // カタログの廃止に伴う置換）。
  // 未指定行 = required、明示登録行 = optional、policy 不在時は全行 required で
  // 実行時エラーで停止しないこと、policy 構文不正・schema 不適合の検出、
  // 要否判定不能時の fail-closed（unavailable）、optional 列挙の未知行の安全側除外、
  // design・implementation 軸の optional 区分機構（REQ-021-031・REQ-021-032）を検証する。

  const SCRIPT_DIR = import.meta.dir;
  const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
  const CHECK_CLI = join(
    REPO_ROOT,
    "src",
    "common",
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
      // check 結合面: 未知行は unknown-req-refs 検査の findings に policy.yaml 由来で計上される
      const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: resolved });
      expect(report.checks["unknown-req-refs"].status).toBe("fail");
      const policyRef = report.checks["unknown-req-refs"].findings.find(
        (f) => f.reqId === "REQ-900-999",
      );
      expect(policyRef?.file).toBe("traceability/policy.yaml");
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
      expect(report.checks["policy-invalid"].status).toBe("fail");
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

  describe("policy 軸拡張: design・implementation optional 区分機構（REQ-021-031・REQ-021-032）", () => {
    // fixture はファイル単位で蓄積されるため、軸拡張の検証は本 describe 専用の
    // 独立要件行（REQ-905-NNN。先行テスト・retired fixture 番号と非衝突）で行う。
    // policy 解決の unknown-req-ref 検査に通すため現行要件集合へ加えて渡す。
    const AXIS_REQ = (n: string) => `REQ-905-${n}`;
    const AXIS_KNOWN = ["REQ-905-001", "REQ-905-002", "REQ-905-003", "REQ-905-004"];
    const axisRootKnown = (): string[] => [...KNOWN, ...AXIS_KNOWN];
    beforeAll(() => {
      writeFixture("docs/requirements/REQ-905.md", [
        "---",
        "id: REQ-905",
        "---",
        "",
        "## 要件",
        "",
        "| ID | 要件 |",
        "|---|---|",
        "| REQ-905-001 | 例 |",
        "| REQ-905-002 | 例 |",
        "| REQ-905-003 | 例 |",
        "| REQ-905-004 | 例 |",
      ]);
    });

    it("design.optional 登録行は missing-design から除外され、他軸は必須のまま", () => {
      writePolicy([
        "verification:",
        "  default: required",
        "design:",
        "  default: required",
        "  optional:",
        `    - ${AXIS_REQ("001")}`,
      ]);
      const resolved = resolveVerificationPolicyFromRoot(ROOT, axisRootKnown());
      expect([...resolved.designOptionalReqIds]).toEqual(["REQ-905-001"]);
      const report = runChecks(scanCorpus(ROOT), KNOWN, {
        completenessReqIds: ["REQ-905-001"],
        verificationPolicy: resolved,
      });
      expect(report.checks["missing-design"].status).toBe("pass");
      // design 軸のみ登録しても implementation・verification は必須のまま
      expect(report.checks["missing-implementation"].status).toBe("fail");
      expect(report.checks["missing-verification"].status).toBe("fail");
    });

    it("implementation.optional 登録行は missing-implementation から除外される", () => {
      writePolicy([
        "verification:",
        "  default: required",
        "implementation:",
        "  default: required",
        "  optional:",
        `    - ${AXIS_REQ("002")}`,
      ]);
      const resolved = resolveVerificationPolicyFromRoot(ROOT, axisRootKnown());
      expect([...resolved.implementationOptionalReqIds]).toEqual(["REQ-905-002"]);
      const report = runChecks(scanCorpus(ROOT), KNOWN, {
        completenessReqIds: ["REQ-905-002"],
        verificationPolicy: resolved,
      });
      expect(report.checks["missing-implementation"].status).toBe("pass");
      // implementation 軸のみ登録しても design は必須のまま
      expect(report.checks["missing-design"].status).toBe("fail");
    });

    it("policy 未登録行は design・implementation 軸とも対応必須のまま", () => {
      writePolicy(["verification:", "  default: required"]);
      const resolved = resolveVerificationPolicyFromRoot(ROOT, axisRootKnown());
      expect(resolved.designOptionalReqIds.size).toBe(0);
      expect(resolved.implementationOptionalReqIds.size).toBe(0);
      const report = runChecks(scanCorpus(ROOT), KNOWN, { completenessReqIds: ["REQ-905-003"], verificationPolicy: resolved });
      expect(report.checks["missing-design"].findings).toEqual([{ reqId: "REQ-905-003" }]);
      expect(report.checks["missing-implementation"].findings).toEqual([{ reqId: "REQ-905-003" }]);
    });

    it("design 軸の unknown-req-ref を unknown-req-refs で検出し、当該行は必須に戻す", () => {
      writePolicy([
        "verification:",
        "  default: required",
        "design:",
        "  default: required",
        "  optional:",
        "    - REQ-900-996",
      ]);
      const resolved = resolveVerificationPolicyFromRoot(ROOT, axisRootKnown());
      expect(resolved.designOptionalReqIds.size).toBe(0);
      const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: resolved });
      expect(report.checks["unknown-req-refs"].status).toBe("fail");
      const policyRef = report.checks["unknown-req-refs"].findings.find((f) => f.reqId === "REQ-900-996");
      expect(policyRef?.file).toBe("traceability/policy.yaml");
    });

    it("design 軸の schema 違反（未知キー・default 不正）を policy-invalid で検出する", () => {
      writePolicy([
        "verification:",
        "  default: required",
        "design:",
        "  default: optional",
        "  unknown-key:",
        `    - ${AXIS_REQ("001")}`,
      ]);
      const resolved = resolveVerificationPolicyFromRoot(ROOT, axisRootKnown());
      expect(resolved.unavailable).toBe(true);
      const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationPolicy: resolved });
      expect(report.checks["policy-invalid"].status).toBe("fail");
      expect(report.checks["policy-invalid"].findings).toHaveLength(2);
    });

    it("policy 解決不能時は optional 登録を読めないため該当行は対応必須に戻る（安全側既定）", () => {
      writePolicy([
        "verification:",
        "  default: required",
        "design:",
        "  default: required",
        "  optional:",
        `    - ${AXIS_REQ("004")}`,
      ]);
      writeFixture("axis/policy-unavailable-marker.md", [""]);
      const resolved = resolveVerificationPolicyFromRoot(ROOT, axisRootKnown());
      expect([...resolved.designOptionalReqIds]).toEqual(["REQ-905-004"]);
      const okReport = runChecks(scanCorpus(ROOT), KNOWN, {
        completenessReqIds: ["REQ-905-004"],
        verificationPolicy: resolved,
      });
      expect(okReport.checks["missing-design"].status).toBe("pass");
      // policy を破損させて解決不能にすると、登録は読めず対応必須に戻る
      rmSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true, force: true });
      mkdirSync(join(ROOT, "traceability", "policy.yaml"), { recursive: true });
      const broken = resolveVerificationPolicyFromRoot(ROOT, axisRootKnown());
      expect(broken.unavailable).toBe(true);
      const brokenReport = runChecks(scanCorpus(ROOT), KNOWN, {
        completenessReqIds: ["REQ-905-004"],
        verificationPolicy: broken,
      });
      expect(brokenReport.checks["missing-design"].status).toBe("fail");
      expect(brokenReport.checks["missing-verification"].status).toBe("fail");
    });

    it("parseVerificationPolicy は verification・design・implementation の3軸を解析する", () => {
      const parsed = parseVerificationPolicy(
        [
          "verification:",
          "  default: required",
          "  optional:",
          "    - REQ-900-001",
          "design:",
          "  optional:",
          "    - REQ-900-002",
          "implementation:",
          "  default: required",
          "  optional:",
          "    - REQ-900-003",
          "    - REQ-900-004",
        ].join("\n"),
      );
      expect(parsed.issues).toEqual([]);
      expect(parsed.unavailable).toBe(false);
      expect([...parsed.optionalReqIds]).toEqual(["REQ-900-001"]);
      expect([...parsed.designOptionalReqIds]).toEqual(["REQ-900-002"]);
      expect([...parsed.implementationOptionalReqIds]).toEqual(["REQ-900-003", "REQ-900-004"]);
    });
  });
});

describe("relied-diff（依拠版に基づく差分・変更影響・増分更新）", () => {
  // relied-diff の公開契約検証（REQ-106、agentdev-traceability Design「impact 拡張（差分候補）」節）。
  // 本テストの verification 対応（REQ-106-001〜011）は、relied_diff.ts への import 実測から
  // 導出機構が宣言する（導出への移行済み。inline・sidecar 宣言は保持しない）。
  // 分類決定表（update / up-to-date / create / unverified）、変更起点の後続伝播
  // （正味差分ゼロでも中間変更を後続へ引き継ぐ）、個別工程確定と全体反映完了の分離判定、
  // 再利用証拠の上流整合確認を、テンポラリ git リポジトリの実 Git 事実で検証する。
  // relied-diff は対応宣言走査に依存しないため、テンポラリリポジトリに対応宣言を配置しない
  // （明示対応が空でも Git 事実から影響候補を返す構造の検証を兼ねる）。

  const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
  const RUN_ID = `trace-relied-${crypto.randomUUID().slice(0, 8)}`;
  const ROOT = join(TEMP_BASE, RUN_ID);
  const ROOT_BROKEN = join(TEMP_BASE, `${RUN_ID}-broken`);
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

  function commitFile(rel: string, content: string, message: string, root: string = ROOT): string {
    const filePath = join(root, rel);
    mkdirSync(join(filePath, ".."), { recursive: true });
    writeFileSync(filePath, content + "\n", "utf-8");
    execFileSync("git", ["-C", root, "add", "."], { encoding: "utf-8" });
    execFileSync("git", ["-C", root, "commit", "-m", message], { encoding: "utf-8" });
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf-8" }).trim();
  }

  function runCli(
    args: readonly string[],
    root: string = ROOT,
  ): { stdout: string; stderr: string; exitCode: number } {
    const proc = Bun.spawnSync(["bun", RELIED_DIFF_CLI, "--root", root, ...args], {
      cwd: process.cwd(),
      stdout: "pipe",
      stderr: "pipe",
    });
    return {
      stdout: proc.stdout.toString(),
      stderr: proc.stderr.toString(),
      exitCode: proc.exitCode ?? -1,
    };
  }

  let commitA = "";
  let commitB = "";
  let commitC = "";
  let commitD = "";
  let brokenA = "";
  let brokenC = "";

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

    // T3/T4 用の隔離リポジトリ: A→B→C（正味差分ゼロ）。git init 直後の全 loose object 構成で、
    // 中間コミット B のツリー loose object を削除して履歴取得（git log --name-only）の失敗を作る。
    mkdirSync(ROOT_BROKEN, { recursive: true });
    execFileSync("git", ["-C", ROOT_BROKEN, "init"], { encoding: "utf-8" });
    execFileSync("git", ["-C", ROOT_BROKEN, "config", "user.name", "test"], { encoding: "utf-8" });
    execFileSync("git", ["-C", ROOT_BROKEN, "config", "user.email", "test@example.invalid"], { encoding: "utf-8" });
    execFileSync("git", ["-C", ROOT_BROKEN, "config", "commit.gpgsign", "false"], { encoding: "utf-8" });
    execFileSync("git", ["-C", ROOT_BROKEN, "config", "core.autocrlf", "false"], { encoding: "utf-8" });
    brokenA = commitFile(UPSTREAM, "v1", "A", ROOT_BROKEN);
    const brokenB = commitFile(UPSTREAM, "v2", "B intermediate", ROOT_BROKEN);
    brokenC = commitFile(UPSTREAM, "v1", "C revert", ROOT_BROKEN);
    const treeLine = execFileSync("git", ["-C", ROOT_BROKEN, "cat-file", "-p", brokenB], {
      encoding: "utf-8",
    })
      .split(/\r?\n/)
      .find((line) => line.startsWith("tree "));
    if (!treeLine) throw new Error("broken fixture: tree line not found");
    const treeSha = treeLine.slice("tree ".length).trim();
    const objectPath = join(ROOT_BROKEN, ".git", "objects", treeSha.slice(0, 2), treeSha.slice(2));
    if (!existsSync(objectPath)) throw new Error(`broken fixture: loose object not found: ${treeSha}`);
    rmSync(objectPath);
  });

  afterAll(() => {
    rmSync(ROOT, { recursive: true, force: true });
    rmSync(ROOT_BROKEN, { recursive: true, force: true });
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

  describe("relied-diff 取得失敗の構造化報告と変更起点の保持", () => {
    it("T1: 無指定＋正味差分ゼロでも中間変更の変更起点が報告に残る（完了判定と分離）", () => {
      const { stdout, exitCode } = runCli(["--relied", commitA, "--head", commitC]);
      expect(exitCode).toBe(0);
      const report = JSON.parse(stdout);
      const u = report.impacts.find((i: { path: string }) => i.path === UPSTREAM);
      expect(u).toBeDefined();
      expect(u.classification).toBe("up-to-date");
      expect(u.intermediateTouched).toBe(true);
      expect(u.propagationRequired).toBe(true);
      expect(u.basis).toContain("後続工程へ引き継ぐ");
      expect(report.emptyResult).toBe(false);
      expect(report.fullyPropagated).toBe("yes");
    });

    it("T2: --paths の不在パスは unverified で報告され、完了判定にならない", () => {
      const { stdout, exitCode } = runCli(["--relied", commitA, "--paths", "ghost.md"]);
      expect(exitCode).toBe(0);
      const report = JSON.parse(stdout);
      const ghost = report.impacts.find((i: { path: string }) => i.path === "ghost.md");
      expect(ghost).toBeDefined();
      expect(ghost.classification).toBe("unverified");
      expect(ghost.basis).toContain("存在せず");
      expect(ghost.basis).toContain("完了」と判定しない");
      expect(report.fullyPropagated).toBe("undetermined");
      expect(report.emptyResult).toBe(false);
    });

    it("T3: 履歴取得失敗は構造化エラーで非ゼロ終了し、空の変更集合として正常扱いしない", () => {
      const { stdout, stderr, exitCode } = runCli(["--relied", brokenA, "--head", brokenC], ROOT_BROKEN);
      expect(exitCode).not.toBe(0);
      expect(stderr).toContain("git-unavailable");
      expect(stdout).not.toContain("fullyPropagated");
    });

    it("T4: lib の listTouchedPaths は履歴取得失敗時に空集合ではなく null を返す", () => {
      expect(listTouchedPaths(ROOT_BROKEN, brokenA, brokenC)).toBe(null);
    });

    it("T5: 同一引数の再実行は同一出力を返す（読取専用・決定論）", () => {
      const first = runCli(["--relied", commitA, "--head", commitC, "--paths", UPSTREAM]);
      const second = runCli(["--relied", commitA, "--head", commitC, "--paths", UPSTREAM]);
      expect(first.exitCode).toBe(0);
      expect(second.exitCode).toBe(0);
      expect(second.stdout).toBe(first.stdout);
    });

    it("T6: 後続消費経路の文書接続が存在する（case-revise 引継ぎ項目・工程駆動の能力参照）", () => {
      const caseRevise = readFileSync("docs/designs/commands/case-revise.md", "utf-8");
      expect(caseRevise).toContain("relied-diff");
      expect(caseRevise).toContain("propagationRequired");
      expect(caseRevise).toContain("unverified");
      expect(caseRevise).toContain("fullyPropagated");
      const v51 = readFileSync(
        "docs/designs/workflows/phase-transition-and-coexistence-model.md",
        "utf-8",
      );
      expect(v51).toContain("relied-diff");
      const traceabilityDesign = readFileSync("docs/designs/skills/agentdev-traceability.md", "utf-8");
      expect(traceabilityDesign).toContain("impact 拡張（差分候補）");
      expect(traceabilityDesign).toContain("relied-diff");
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
});

describe("impact（変更影響候補）", () => {
  // impact の公開契約検証（OU-002、Issue #2360）。
  // 探索範囲の上限（成果物 ↔ 要件 ↔ 成果物、固定2ホップ）、
  // 空結果の扱い（「影響なし」の証明としない）。

  const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
  const RUN_ID = `trace-imp-${crypto.randomUUID().slice(0, 8)}`;
  const ROOT = join(TEMP_BASE, RUN_ID);

  const MARKER = ["ADF", "-", "COVERS"].join("");

  // フィクスチャ用の宣言行生成。実リポジトリのコーパス走査での誤検出を避けるため
  // マーカーはパーツ結合経由で組み立てる。
  function decl(role: string, ids: string): string {
    return `<!-- ${MARKER}(${role}): ${ids} -->`;
  }

  // TypeScript 正規宣言位置（行頭 // コメント）用の宣言行生成。
  // 対象外判定により .ts 内の HTML コメント行は prose として無視されるため使い分ける。
  function tsDecl(role: string, ids: string): string {
    return `// ${MARKER}(${role}): ${ids}`;
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

  describe("impact（要件起点）", () => {
    it("当該要件へ明示的に対応する成果物を再確認候補として返す", () => {
      writeFixture("docs/d1.md", [decl("design", "REQ-900-001")]);
      writeFixture("src/i1.ts", [tsDecl("implementation", "REQ-900-001")]);
      writeFixture("tests/v1.test.ts", [tsDecl("verification", "REQ-900-001")]);
      const { declarations } = scanCorpus(ROOT);
      const result = impactByRequirement(declarations, "REQ-900-001");
      expect(result.mode).toBe("requirement");
      expect(result.recheckCandidates).toHaveLength(3);
      const roles = result.recheckCandidates.map((c) => c.role).sort();
      expect(roles).toEqual(["design", "implementation", "verification"]);
    });

    it("Decision 対応（decision 役割）を含む役割付き候補を返す（TS-006、RA-004）", () => {
      writeFixture("docs/dec/d2.md", [decl("decision", "REQ-900-011")]);
      writeFixture("src/i11.ts", [tsDecl("implementation", "REQ-900-011")]);
      const { declarations } = scanCorpus(ROOT);
      const result = impactByRequirement(declarations, "REQ-900-011");
      expect(result.recheckCandidates.map((c) => c.role)).toEqual(["decision", "implementation"]);
    });

    it("対応のない要件は空結果を明示し、影響なしの証明として扱わない（AC-005）", () => {
      const { declarations } = scanCorpus(ROOT);
      const result = impactByRequirement(declarations, "REQ-900-999");
      expect(result.emptyResult).toBe(true);
      expect(result.recheckCandidates).toEqual([]);
      expect(result.note).toBeDefined();
      expect(result.note).toContain("影響なし");
      // 「影響なし」と断定するフィールドを持たない
      expect(JSON.stringify(result)).not.toMatch(/"(impactNone|noImpact|proved)"\s*:\s*true/);
    });
  });

  describe("impact（成果物起点）", () => {
    it("対応要件を経由して同じ要件へ対応する他成果物を再確認候補として返す（起点自身を除く）", () => {
      writeFixture("src/start.ts", [tsDecl("implementation", "REQ-900-201, REQ-900-202")]);
      writeFixture("docs/other-design.md", [decl("design", "REQ-900-201")]);
      writeFixture("src/other-impl.ts", [tsDecl("implementation", "REQ-900-202")]);
      writeFixture("tests/other-test.test.ts", [tsDecl("verification", "REQ-900-201, REQ-900-202")]);
      const { declarations } = scanCorpus(ROOT);
      const result = impactByArtifact(declarations, "src/start.ts");
      expect(result.viaRequirements).toHaveLength(2);
      // other-test.test.ts は2つの経由要件それぞれから候補となる（file:line:viaReqId 単位）
      expect(result.recheckCandidates).toHaveLength(4);
      const files = [...new Set(result.recheckCandidates.map((c) => c.file))].sort();
      expect(files).toEqual([
        "docs/other-design.md",
        "src/other-impl.ts",
        "tests/other-test.test.ts",
      ]);
      // 起点成果物自身を候補に含めない
      expect(result.recheckCandidates.every((c) => c.file !== "src/start.ts")).toBe(true);
      // 経由要件が候補ごとに保持される
      expect(result.recheckCandidates.every((c) => c.viaReqId.startsWith("REQ-900-2"))).toBe(true);
    });

    it("成果物 ↔ 要件 ↔ 成果物の範囲を超えて探索しない（AC-004、固定2ホップ）", () => {
      // 経路: a → R1 → b → R2 → c。a 起点の候補は b までであり、R2 と c を含まない。
      writeFixture("chain/a.md", [decl("implementation", "REQ-900-301")]);
      writeFixture("chain/b.md", [decl("implementation", "REQ-900-301"), decl("design", "REQ-900-302")]);
      writeFixture("chain/c.md", [decl("implementation", "REQ-900-302")]);
      const { declarations } = scanCorpus(ROOT);
      const result = impactByArtifact(declarations, "chain/a.md");
      expect(result.recheckCandidates).toHaveLength(1);
      expect(result.recheckCandidates[0]?.file).toBe("chain/b.md");
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain("REQ-900-302");
      expect(serialized).not.toContain("chain/c.md");
    });

    it("どの要件にも対応しない成果物は空結果を明示する", () => {
      writeFixture("lonely/x.md", ["# 対応宣言なし"]);
      const { declarations } = scanCorpus(ROOT);
      const result = impactByArtifact(declarations, "lonely/x.md");
      expect(result.emptyResult).toBe(true);
      expect(result.recheckCandidates).toEqual([]);
      expect(result.note).toContain("影響なし");
    });

    it("同じ要件を経由する複数ホップ候補を重なく返す", () => {
      writeFixture("dup/base.md", [decl("implementation", "REQ-900-401")]);
      writeFixture("dup/x.md", [decl("verification", "REQ-900-401"), decl("design", "REQ-900-401")]);
      const { declarations } = scanCorpus(ROOT);
      const result = impactByArtifact(declarations, "dup/base.md");
      // x.md の2宣言は同一ファイル内の別行なので2件（file:line:viaReqId 単位）
      expect(result.recheckCandidates).toHaveLength(2);
    });
  });
});

describe("coverage（対応関係の全件取得）", () => {
  // coverage の公開契約検証（OU-002、Issue #2360）。
  // 全件返却（候補数上限・ランキング・探索深度による黙った切り捨ての不在）、
  // 要件起点・成果物起点の双方向、空結果と基盤障害の区別、
  // 4役割（decision 含む）の役割付き出力と sidecar / inline 正規化（TS-003、TS-006）。

  const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
  const RUN_ID = `trace-cov-${crypto.randomUUID().slice(0, 8)}`;
  const ROOT = join(TEMP_BASE, RUN_ID);

  const MARKER = ["ADF", "-", "COVERS"].join("");

  // フィクスチャ用の宣言行生成。実リポジトリのコーパス走査での誤検出を避けるため
  // マーカーはパーツ結合経由で組み立てる。
  function decl(role: string, ids: string): string {
    return `<!-- ${MARKER}(${role}): ${ids} -->`;
  }

  // TypeScript 正規宣言位置（行頭 // コメント）用の宣言行生成。
  // 対象外判定により .ts 内の HTML コメント行は prose として無視されるため使い分ける。
  function tsDecl(role: string, ids: string): string {
    return `// ${MARKER}(${role}): ${ids}`;
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

  describe("coverage（要件起点）", () => {
    it("1要件に複数役割の対応成果物があるとき全件を役割付きで返す（RU-0002 検証: 正常系）", () => {
      writeFixture("docs/designs/x.md", [decl("design", "REQ-900-001")]);
      writeFixture("src/a.ts", [tsDecl("implementation", "REQ-900-001")]);
      writeFixture("src/b.ts", [tsDecl("implementation", "REQ-900-001, REQ-900-002")]);
      writeFixture("tests/v.test.ts", [tsDecl("verification", "REQ-900-001")]);
      const { declarations } = scanCorpus(ROOT);
      const result = coverageByRequirement(declarations, "REQ-900-001");
      expect(result.mode).toBe("requirement");
      expect(result.relations).toHaveLength(4);
      expect(result.counts).toEqual({
        decision: 0,
        design: 1,
        implementation: 2,
        verification: 1,
        total: 4,
      });
      expect(result.truncated).toBe(false);
      expect(result.emptyResult).toBe(false);
    });

    it("Decision 対応を含む4役割の対応関係を役割付きで返す（TS-006、RA-004）", () => {
      writeFixture("docs/dec/d1.md", [
        decl("decision", "REQ-900-005"),
        decl("design", "REQ-900-005"),
      ]);
      writeFixture("src/i5.ts", [tsDecl("implementation", "REQ-900-005")]);
      writeFixture("tests/v5.test.ts", [tsDecl("verification", "REQ-900-005")]);
      const { declarations } = scanCorpus(ROOT);
      const result = coverageByRequirement(declarations, "REQ-900-005");
      expect(result.counts).toEqual({
        decision: 1,
        design: 1,
        implementation: 1,
        verification: 1,
        total: 4,
      });
      expect(result.relations.map((r) => r.role)).toEqual([
        "decision",
        "design",
        "implementation",
        "verification",
      ]);
    });

    it("sidecar と inline の同一論理対応関係を同一の coverage 関係として正規化する（TS-003）", () => {
      writeFixture("traceability/normalized.yaml", [
        "component: normalized",
        "implementation:",
        "  normalized/impl.ts:",
        "    - REQ-900-006",
      ]);
      writeFixture("normalized/impl.ts", [tsDecl("implementation", "REQ-900-006")]);
      const { declarations } = scanCorpus(ROOT);
      const result = coverageByRequirement(declarations, "REQ-900-006");
      // sidecar 由来（line: 0）と inline 由来（実行番号）の2件が同一論理関係として返る
      expect(result.counts).toEqual({
        decision: 0,
        design: 0,
        implementation: 2,
        verification: 0,
        total: 2,
      });
      expect(result.relations.every((r) => r.file === "normalized/impl.ts")).toBe(true);
      // 成果物起点でも同一に解決される
      const byArtifact = coverageByArtifact(declarations, "normalized/impl.ts");
      expect(byArtifact.relations.map((r) => r.reqId)).toEqual(["REQ-900-006", "REQ-900-006"]);
    });

    it("大量の宣言があっても全件を返し、候補数上限によって切り捨てない（AC-003）", () => {
      const lines = Array.from({ length: 30 }, (_, i) =>
        decl("implementation", `REQ-900-0${String(10 + i).padStart(2, "0")}`),
      );
      lines.push(decl("implementation", "REQ-900-010"));
      writeFixture("docs/big.md", lines);
      const { declarations } = scanCorpus(ROOT);
      const result = coverageByRequirement(declarations, "REQ-900-010");
      expect(result.relations).toHaveLength(2);
      const all = coverageByRequirement(declarations, "REQ-900-010");
      expect(all.counts.total).toBe(2);
      // 30宣言すべてが要件単位で取得可能（切り捨てなし）
      const totalDecls = declarations.filter((d) =>
        d.reqIds.some((id) => id.startsWith("REQ-900-0")),
      ).length;
      expect(totalDecls).toBeGreaterThanOrEqual(31);
    });

    it("対応宣言のない要件は空結果として返す（空状態と基盤障害の区別）", () => {
      const { declarations } = scanCorpus(ROOT);
      const result = coverageByRequirement(declarations, "REQ-900-999");
      expect(result.relations).toEqual([]);
      expect(result.emptyResult).toBe(true);
      expect(result.truncated).toBe(false);
    });
  });

  describe("coverage（成果物起点）", () => {
    it("1成果物から複数要件への対応を全件返す（RU-0002 検証: 逆引き）", () => {
      writeFixture("src/multi.ts", [
        tsDecl("implementation", "REQ-900-101, REQ-900-102"),
        tsDecl("verification", "REQ-900-101"),
      ]);
      const { declarations } = scanCorpus(ROOT);
      const result = coverageByArtifact(declarations, "src/multi.ts");
      expect(result.mode).toBe("artifact");
      expect(result.artifact).toBe("src/multi.ts");
      expect(result.relations).toHaveLength(3);
      const reqIds = result.relations.map((r) => r.reqId).sort();
      expect(reqIds).toEqual(["REQ-900-101", "REQ-900-101", "REQ-900-102"]);
      expect(result.truncated).toBe(false);
    });

    it("対応宣言のない成果物は空結果（emptyResult）として返す", () => {
      writeFixture("docs/plain.md", ["# 宣言のない文書"]);
      const { declarations } = scanCorpus(ROOT);
      const result = coverageByArtifact(declarations, "docs/plain.md");
      expect(result.relations).toEqual([]);
      expect(result.emptyResult).toBe(true);
    });
  });
});
