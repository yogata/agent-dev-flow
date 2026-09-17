// ADF-COVERS(verification): REQ-012-053, REQ-012-055
//
// agentdev-traceability 配布スキルの sidecar 読込と種別非依存走査の検証
// （TS-002、TS-005）。top-level traceability/ 配下の component / package 単位
// sidecar が artifact パス・role・要件行 ID のみの最小データで対応関係を解決
// できること（専用 ID・digest 不在でエラーにならない）、.md / .ts 以外の拡張子
// を持つ成果物が sidecar から参照され拡張子フィルタで除外されないこと、
// policy.yaml が sidecar 走査から除外されることを検証する。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";
import { coverageByRequirement, impactByArtifact } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/query.ts";
import { POLICY_FILE_REL } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-sidecar-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);

const MARKER = ["ADF", "-", "COVERS"].join("");
const KNOWN = ["REQ-900-101", "REQ-900-102", "REQ-900-103"];

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
  writeFixture("docs/requirements/REQ-900.md", [
    "| ID | 要件 |",
    "|---|---|",
    ...KNOWN.map((id) => `| ${id} | 例 |`),
  ]);
});
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("sidecar の最小データ読込（TS-002）", () => {
  it("component 単位 sidecar が最小データのみで coverage / check を解決する", () => {
    writeFixture("traceability/agent-minimal.yaml", [
      "component: agent-minimal",
      "design:",
      "  docs/designs/minimal.md:",
      "    - REQ-900-101",
      "implementation:",
      "  src/minimal.ts:",
      "    - REQ-900-101",
      "verification:",
      "  tests/minimal.test.ts:",
      "    - REQ-900-101",
    ]);
    // 参照先 artifact を実在させる（design / implementation / verification の実ファイル）
    writeFixture("docs/designs/minimal.md", ["# minimal"]);
    writeFixture("src/minimal.ts", ["export const x = 1;"]);
    writeFixture("tests/minimal.test.ts", ["import { test } from 'bun:test';"]);

    const scan = scanCorpus(ROOT);
    expect(scan.sidecarIssues).toEqual([]);
    // 専用 artifact ID・関係 ID・revision・digest を含まないデータで成立する
    const serialized = JSON.stringify(scan.declarations);
    expect(serialized.includes("digest")).toBe(false);
    expect(serialized.includes("revision")).toBe(false);

    const coverage = coverageByRequirement(scan.declarations, "REQ-900-101");
    expect(coverage.counts).toEqual({
      decision: 0,
      design: 1,
      implementation: 1,
      verification: 1,
      total: 3,
    });

    const report = runChecks(scan, KNOWN, { completenessReqIds: ["REQ-900-101"] });
    expect(report.checks["invalid-artifact-paths"].status).toBe("pass");
    expect(report.checks["malformed-declarations"].status).toBe("pass");
    expect(report.checks["duplicate-inconsistencies"].status).toBe("pass");
  });

  it("package 単位の識別子を持つ sidecar も受理する", () => {
    writeFixture("traceability/pkg-scripts.yaml", [
      "component: pkg-scripts",
      "implementation:",
      "  scripts/run.ts:",
      "    - REQ-900-102",
    ]);
    writeFixture("scripts/run.ts", ["console.log('x');"]);
    const scan = scanCorpus(ROOT);
    expect(scan.sidecarIssues).toEqual([]);
    expect(
      scan.declarations.some(
        (d) =>
          d.source === "sidecar" &&
          d.sourceFile === "traceability/pkg-scripts.yaml" &&
          d.file === "scripts/run.ts" &&
          d.reqIds.includes("REQ-900-102"),
      ),
    ).toBe(true);
  });

  it("policy.yaml は sidecar 走査から除外される", () => {
    writeFixture("traceability/policy.yaml", [
      "verification:",
      "  default: required",
      "  optional:",
      "    - REQ-900-103",
    ]);
    const scan = scanCorpus(ROOT);
    expect(
      scan.declarations.some((d) => d.sourceFile === POLICY_FILE_REL),
    ).toBe(false);
    expect(scan.sidecarIssues).toEqual([]);
  });
});

describe("種別非依存の対応関係（TS-005）", () => {
  it(".md / .ts 以外の成果物を sidecar から参照し coverage / impact / check が解決する", () => {
    writeFixture("traceability/ops-assets.yaml", [
      "component: ops-assets",
      "implementation:",
      "  tools/deploy.ps1:",
      "    - REQ-900-103",
      "  data/config.json:",
      "    - REQ-900-103",
      "  charts/values.yaml:",
      "    - REQ-900-103",
    ]);
    // .ps1 / .json / .yaml は inline 宣言の走査対象拡張子（.md / .ts）外だが、
    // sidecar からの対応対象としては解決されなければならない
    writeFixture("tools/deploy.ps1", ["Write-Output 'deploy'"]);
    writeFixture("data/config.json", ['{"key": "value"}']);
    writeFixture("charts/values.yaml", ["replicas: 1"]);

    const scan = scanCorpus(ROOT);
    expect(scan.sidecarIssues).toEqual([]);
    expect(scan.sidecarMissingArtifacts).toEqual([]);

    const coverage = coverageByRequirement(scan.declarations, "REQ-900-103");
    const files = coverage.relations.map((r) => r.file).sort();
    expect(files).toEqual(["charts/values.yaml", "data/config.json", "tools/deploy.ps1"]);

    const impact = impactByArtifact(scan.declarations, "tools/deploy.ps1");
    expect(impact.viaRequirements.map((v) => v.reqId)).toEqual(["REQ-900-103"]);

    const report = runChecks(scan, KNOWN, { completenessReqIds: ["REQ-900-103"] });
    expect(report.checks["invalid-artifact-paths"].status).toBe("pass");
    // REQ-900-103 の実装対応は sidecar 経由で解決されている
    expect(report.checks["missing-implementation"].findings).toEqual([]);
  });

  it("参照先が存在しない場合、拡張子に関係なく不在として検出される", () => {
    writeFixture("traceability/missing-ext.yaml", [
      "component: missing-ext",
      "implementation:",
      "  bin/tool.exe:",
      "    - REQ-900-101",
    ]);
    const scan = scanCorpus(ROOT);
    expect(scan.sidecarMissingArtifacts).toEqual([
      { artifact: "bin/tool.exe", sidecarFile: "traceability/missing-ext.yaml" },
    ]);
  });
});
