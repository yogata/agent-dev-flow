// ADF-COVERS(verification): REQ-012-047
//
// agentdev-traceability 配布スキル check の元来の6種検査の検証（OU-002、Issue #2360）。
// 7種目（invalid-catalog-refs）は traceability_verification_scope.test.ts が検証する。
// 不正な対応宣言、未知の成果物役割、存在しない要件への参照、
// 実装対応の欠落、検証対応の欠落の個別検出、正常な Design 対応0件を異常としないこと。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { locateEvidence, scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";
import { currentRequirementLineIds } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/requirements.ts";

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

  it("Design 対応0件のみを理由に異常としない（AC-008）", () => {
    writeFixture("clean/a.ts", [tsDecl("implementation", "REQ-900-003")]);
    writeFixture("clean/b.test.ts", [tsDecl("verification", "REQ-900-003")]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, KNOWN, { completenessReqIds: ["REQ-900-003"] });
    expect(report.checks["missing-implementation"].status).toBe("pass");
    expect(report.checks["missing-verification"].status).toBe("pass");
    // design 役割の欠落を検出する検査項目が存在しない
    expect(Object.keys(report.checks).some((k) => k.includes("design"))).toBe(false);
  });

  it("存在しない成果物パスを evidence-unavailable で検出する", () => {
    const scan = scanCorpus(ROOT);
    const evidence = locateEvidence(ROOT, "not/found.md");
    expect(evidence.ok).toBe(false);
    if (!evidence.ok) {
      expect(evidence.reason).toBe("file-not-found");
    }
    const report = runChecks(scan, KNOWN, {
      evidenceArtifacts: [{ artifact: "not/found.md", reason: "file-not-found" }],
    });
    expect(report.checks["evidence-unavailable"].status).toBe("fail");
    expect(report.checks["evidence-unavailable"].findings[0]?.artifact).toBe("not/found.md");
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
