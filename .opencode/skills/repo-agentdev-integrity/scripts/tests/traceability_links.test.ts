// agentdev-traceability 配布スキルの隣接工程間対応（links）能力の検証。
// 対応関係: REQ-107-001, REQ-107-002, REQ-107-004, REQ-107-005, REQ-107-006, REQ-107-007（sidecar 正規配置・traceability/agentdev-traceability.yaml）。
//
// - 採用された隣接工程間の成果物を1方向宣言（upstream）で関連付け、上流と下流を
//   双方向に追跡できること。存在しない詳細工程への対応を強制しないこと
//   （REQ-107-001）
// - links 対応のみの成果物が covers の対応完全性判定に入らず、links による
//   グループ化が子要件行単位の covers 計上と検証義務を消さないこと（REQ-107-002、
//   REQ-107-006）
// - links の参照先不存在を構造検査で検出し、check の pass が意味的品質の証明に
//   ならないこと（structuralOnly）（REQ-107-004、REQ-107-007）
// - links 検査は参照整合のみであり、見出し・説明節の存在や本文 prose 内の
//   マーカー形状の言及を機械的な合格条件・不合格条件にしないこと（REQ-107-005）

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseLinkDeclarations, parseSidecarLinks } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/links.ts";
import { scanCorpus } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/check.ts";
import { currentRequirementLineIds } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/requirements.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-links-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);

const KNOWN = ["REQ-900-201", "REQ-900-202"];

function writeFixture(rel: string, lines: readonly string[]): void {
  const filePath = join(ROOT, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

function writeRequirements(): void {
  writeFixture("docs/requirements/REQ-900b.md", [
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

describe("隣接工程間対応の宣言解析（REQ-107-001）", () => {
  it("inline upstream 宣言を1件の link relation として解析する", () => {
    const parsed = parseLinkDeclarations("src/impl.ts", [
      "const x = 1;",
      "// ADF-LINKS(upstream): docs/designs/spec.md, docs/requirements/req.md",
    ].join("\n"));
    expect(parsed.issues).toEqual([]);
    expect(parsed.links).toEqual([
      { source: "src/impl.ts", target: "docs/designs/spec.md", direction: "upstream", origin: "inline", sourceFile: "src/impl.ts", line: 2 },
      { source: "src/impl.ts", target: "docs/requirements/req.md", direction: "upstream", origin: "inline", sourceFile: "src/impl.ts", line: 2 },
    ]);
  });

  it("本文 prose 内のマーカー形状の言及は宣言と解釈しない", () => {
    const parsed = parseLinkDeclarations("docs/designs/spec.md", [
      "# 設計",
      "ADF-LINKS(upstream): src/impl.ts という形式の宣言をこの文書では使わない。",
      "<!-- ADF-LINKS(upstream): src/impl.ts -->",
    ].join("\n"));
    expect(parsed.issues).toEqual([]);
    expect(parsed.links.length).toBe(1);
    expect(parsed.links[0]!.line).toBe(3);
  });

  it("不明方向は unknown-link-direction、形式不備は malformed-link-declaration を報告する", () => {
    const parsed = parseLinkDeclarations("src/impl.ts", [
      "// ADF-LINKS(downstream): docs/next.md",
      "// ADF-LINKS(upstream):",
    ].join("\n"));
    expect(parsed.links).toEqual([]);
    expect(parsed.issues.map((i) => i.reason).sort()).toEqual([
      "malformed-link-declaration",
      "unknown-link-direction",
    ]);
  });

  it("sidecar links セクションを正規化し、schema 不正を silent skip しない", () => {
    const ok = parseSidecarLinks("traceability/comp.yaml", {
      upstream: { "src/impl.ts": ["docs/designs/spec.md"] },
    });
    expect(ok.issues).toEqual([]);
    expect(ok.links).toEqual([
      { source: "src/impl.ts", target: "docs/designs/spec.md", direction: "upstream", origin: "sidecar", sourceFile: "traceability/comp.yaml", line: 0 },
    ]);
    const bad = parseSidecarLinks("traceability/comp.yaml", {
      downward: { "src/impl.ts": ["docs/designs/spec.md"] },
      upstream: { "src/impl.ts": [] },
    });
    expect(bad.links).toEqual([]);
    expect(bad.issues.every((i) => i.reason === "invalid-sidecar-links-schema")).toBe(true);
  });
});

describe("双方向追跡と非強制（REQ-107-001）", () => {
  it("1方向宣言（upstream）から下流→上流と上流→下流の双方向が追跡できる", () => {
    writeFixture("docs/designs/spec.md", ["# 設計"]);
    writeFixture("src/impl.ts", [
      "// ADF-LINKS(upstream): docs/designs/spec.md",
      "export const x = 1;",
    ]);
    const scan = scanCorpus(ROOT);
    expect(scan.linkIssues).toEqual([]);
    expect(scan.linkMissingArtifacts).toEqual([]);
    const upstream = scan.links.filter((l) => l.source === "src/impl.ts").map((l) => l.target);
    const downstream = scan.links.filter((l) => l.target === "docs/designs/spec.md").map((l) => l.source);
    expect(upstream).toEqual(["docs/designs/spec.md"]);
    expect(downstream).toEqual(["src/impl.ts"]);
  });

  it("links 宣言が無い corpus でも check は links 系検査で不合格にしない", () => {
    const scan = scanCorpus(ROOT);
    const knownReqIds = currentRequirementLineIds(ROOT);
    const report = runChecks(scan, knownReqIds, { completenessReqIds: [] });
    expect(report.checks["malformed-links"].status).toBe("pass");
    expect(report.checks["dangling-links"].status).toBe("pass");
    expect(report.checks["malformed-links"].findings).toEqual([]);
  });
});

describe("covers 完全性からの分離とグループ化（REQ-107-002、REQ-107-006）", () => {
  it("links 対応のみの成果物は covers declarations に混入せず missing-* 判定に入らない", () => {
    writeFixture("src/linked-only.ts", ["// ADF-LINKS(upstream): docs/designs/spec.md"]);
    const scan = scanCorpus(ROOT);
    expect(scan.declarations.some((d) => d.file === "src/linked-only.ts")).toBe(false);
    expect(scan.links.some((l) => l.source === "src/linked-only.ts")).toBe(true);
  });

  it("子要件行単位の covers 計上は links のグループ化で消えない", () => {
    // 1つの links 宣言が複数要件行の成果物群を束ねていても、covers の完全性
    // 検査は要件行単位で行われる。REQ-900-202 の design 対応が無い場合、
    // links 宣言の存在とは無関係に missing-design に REQ-900-202 のみ計上される
    writeFixture("traceability/group-component.yaml", [
      "component: group-component",
      "design:",
      "  docs/designs/spec.md:",
      "    - REQ-900-201",
      "implementation:",
      "  src/impl.ts:",
      "    - REQ-900-201",
      "links:",
      "  upstream:",
      "    src/impl.ts:",
      "      - docs/designs/spec.md",
    ]);
    const scan = scanCorpus(ROOT);
    const knownReqIds = currentRequirementLineIds(ROOT);
    const report = runChecks(scan, knownReqIds, { completenessReqIds: KNOWN });
    const missingDesignIds = report.checks["missing-design"].findings.map((f) => f.reqId);
    expect(missingDesignIds).toEqual(["REQ-900-202"]);
    const missingImplIds = report.checks["missing-implementation"].findings.map((f) => f.reqId);
    expect(missingImplIds).toEqual(["REQ-900-202"]);
  });
});

describe("構造検査と参照整合（REQ-107-004、REQ-107-005）", () => {
  it("target の不存在を dangling-links として検出する", () => {
    writeFixture("src/dangling.ts", ["// ADF-LINKS(upstream): docs/designs/missing-spec.md"]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, currentRequirementLineIds(ROOT), { completenessReqIds: [] });
    expect(report.checks["dangling-links"].status).toBe("fail");
    const finding = report.checks["dangling-links"].findings.find(
      (f) => f.artifact === "docs/designs/missing-spec.md",
    );
    expect(finding?.reason).toBe("link-target-not-found");
  });

  it("sidecar links の source 不在も dangling-links として検出する", () => {
    writeFixture("traceability/dangling-sidecar.yaml", [
      "component: dangling-sidecar",
      "links:",
      "  upstream:",
      "    docs/designs/gone-source.md:",
      "      - docs/designs/spec.md",
    ]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, currentRequirementLineIds(ROOT), { completenessReqIds: [] });
    const finding = report.checks["dangling-links"].findings.find(
      (f) => f.artifact === "docs/designs/gone-source.md",
    );
    expect(finding?.reason).toBe("link-source-not-found");
  });

  it("links 検査は内容を評価せず、見出し・説明節のみの成果物への参照を一律不合格にしない", () => {
    // 参照先が見出しと説明節のみの文書（実質内容なし）でも構造上存在すれば合格。
    // links 検査は参照整合のみで内容（意味的品質）を判定しない
    writeFixture("docs/designs/heading-only.md", ["# 見出しのみの文書", "説明節。"]);
    writeFixture("src/to-heading.ts", ["// ADF-LINKS(upstream): docs/designs/heading-only.md"]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, currentRequirementLineIds(ROOT), { completenessReqIds: [] });
    const headingDangling = report.checks["dangling-links"].findings.filter(
      (f) => f.artifact === "docs/designs/heading-only.md",
    );
    expect(headingDangling).toEqual([]);
  });
});

describe("構造検査の境界明示（REQ-107-004、REQ-107-007）", () => {
  it("check の出力は structuralOnly: true を常に含み、pass が意味的品質の証明にならない", () => {
    writeFixture("traceability/clean-component.yaml", [
      "component: clean-component",
      "design:",
      "  docs/designs/spec.md:",
      "    - REQ-900-201",
      "implementation:",
      "  src/impl.ts:",
      "    - REQ-900-201",
      "verification:",
      "  tests/clean.test.ts:",
      "    - REQ-900-201",
      "links:",
      "  upstream:",
      "    src/impl.ts:",
      "      - docs/designs/spec.md",
    ]);
    writeFixture("tests/clean.test.ts", ["import { test } from 'bun:test';"]);
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, currentRequirementLineIds(ROOT), { completenessReqIds: [] });
    // links が完全でも、check の pass は受け入れ条件の最終実証を代替しない。
    // structuralOnly: true がその境界の構造的証拠として常に出力される
    expect(report.structuralOnly).toBe(true);
    // clean-component.yaml の links（src/impl.ts → docs/designs/spec.md）は両辺とも
    // 実在するため dangling finding に計上されない
    const cleanDangling = report.checks["dangling-links"].findings.filter(
      (f) => f.artifact === "docs/designs/spec.md" || f.artifact === "src/impl.ts",
    );
    expect(cleanDangling).toEqual([]);
  });
});
