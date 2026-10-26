//
// traceability sidecar 重複キー検出の回帰テスト（REQ-117-006・AG-006 (a)）。
//
// Bun.YAML の last-wins 解釈では重複キーの shadow 義務が黙って失われるため、
// parse 前の raw parse（行ベース走査）で重複キーを issues として検出できることを
// 検証する。PR #3819 相当の重複が再発時に検出されることを目標とする。

import { describe, expect, test } from "bun:test";
import { detectDuplicateSidecarKeys, parseSidecar } from "../../../../src/common/skills/agentdev-traceability/scripts/lib/sidecar.ts";

const validSidecar = `component: test-component
implementation:
  src/example/impl.ts:
  - REQ-001-001
  - REQ-001-002
`;

const duplicateSidecar = `component: test-component
implementation:
  src/example/impl.ts:
  - REQ-001-001
  - REQ-001-002
implementation:
  src/example/other.ts:
  - REQ-001-003
`;

describe("REQ-117-006: sidecar 重複キーの機械検出", () => {
  test("重複キーを含む sidecar で detectDuplicateSidecarKeys が重複を検出する", () => {
    const dups = detectDuplicateSidecarKeys(duplicateSidecar);
    expect(dups.length).toBe(1);
    expect(dups[0]?.key).toBe("implementation");
    expect(dups[0]?.line).toBe(6);
  });

  test("重複キーなしの sidecar では検出 0 件であること", () => {
    const dups = detectDuplicateSidecarKeys(validSidecar);
    expect(dups.length).toBe(0);
  });

  test("parseSidecar が重複キーを issues（invalid-schema）として報告する", () => {
    const result = parseSidecar("traceability/test.yaml", duplicateSidecar);
    const dupIssues = result.issues.filter((i) => i.detail.includes("重複キー"));
    expect(dupIssues.length).toBe(1);
    expect(dupIssues[0]?.reason).toBe("invalid-schema");
    expect(dupIssues[0]?.detail).toContain("implementation");
    expect(dupIssues[0]?.detail).toContain("last-wins");
  });

  test("Bun.YAML.parse の last-wins 解釈では shadow された側の関係が失われることの対照確認（検出手段の根拠）", () => {
    const result = parseSidecar("traceability/test.yaml", duplicateSidecar);
    const implRelations = result.relations.filter((r) => r.role === "implementation");
    expect(implRelations.length).toBe(1);
    expect(implRelations[0]?.artifact).toBe("src/example/other.ts");
  });

  test("正常な sidecar は issues に重複キー起因の報告を含まないこと", () => {
    const result = parseSidecar("traceability/test.yaml", validSidecar);
    expect(result.issues.filter((i) => i.detail.includes("重複キー")).length).toBe(0);
  });
});
