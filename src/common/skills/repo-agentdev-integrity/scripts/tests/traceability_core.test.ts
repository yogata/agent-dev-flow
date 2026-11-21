// ADF-COVERS(verification): REQ-012-043, REQ-012-050
//
// agentdev-traceability 配布スキルの基本契約の統合検証。対応宣言の解析仕様
// （行単位パターン照合、和集合、意味推定なし）と配置・構造（lib 解析コアと CLI の分離）、
// 隣接工程間対応（links）、sidecar 読込と種別非依存走査、sidecar 重複キー異常系、
// 対応宣言導出機構、棚卸し（inventory）、証拠再利用（reuse）を検証する。
//
// REQ-117-006 が依存する sidecar 重複キー異常系は、下記
// 「REQ-117-006: sidecar 重複キーの機械検出」セクションに観点を明示して維持する
// （RA-002・CR-006）。

import { afterAll, beforeAll, describe, expect, it, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runChecks } from "../../../../skills/agentdev-traceability/scripts/lib/check.ts";
import { scanCorpus, POLICY_FILE_REL } from "../../../../skills/agentdev-traceability/scripts/lib/corpus.ts";
import { parseDeclarations } from "../../../../skills/agentdev-traceability/scripts/lib/declarations.ts";
import { deriveFromManualDeclarations, parseDerivationsConfig, resolveDerivationsFromRoot } from "../../../../skills/agentdev-traceability/scripts/lib/derivations.ts";
import { buildInventory } from "../../../../skills/agentdev-traceability/scripts/lib/inventory.ts";
import { parseLinkDeclarations, parseSidecarLinks } from "../../../../skills/agentdev-traceability/scripts/lib/links.ts";
import { coverageByRequirement, impactByArtifact } from "../../../../skills/agentdev-traceability/scripts/lib/query.ts";
import { currentRequirementLineIds } from "../../../../skills/agentdev-traceability/scripts/lib/requirements.ts";
import { evaluateEvidenceReuse } from "../../../../skills/agentdev-traceability/scripts/lib/reuse.ts";
import { detectDuplicateSidecarKeys, parseSidecar } from "../../../../skills/agentdev-traceability/scripts/lib/sidecar.ts";
import { resolveVerificationPolicyFromRoot } from "../../../../skills/agentdev-traceability/scripts/lib/verification_scope.ts";

describe("対応宣言の解析と配置構造", () => {
  // フィクスチャ用の宣言行生成。テストソース内に完成形のマーカー文字列を直接
  // 記述すると実リポジトリのコーパス走査で実宣言として誤検出されるため、
  // マーカーはパーツ結合経由で組み立てる。
  const MARKER = ["ADF", "-", "COVERS"].join("");
  const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
  const RUN_ID = `trace-decls-${crypto.randomUUID().slice(0, 8)}`;
  const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

  function decl(role: string, ids: string): string {
    return `<!-- ${MARKER}(${role}): ${ids} -->`;
  }

  beforeAll(() => {
    mkdirSync(TEMP_ROOT, { recursive: true });
  });
  afterAll(() => {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
  });

  describe("対応宣言の解析", () => {
    it("完全形式の宣言行を役割と要件IDリストとして解析する", () => {
      const content = [
        decl("implementation", "REQ-900-001"),
        decl("verification", "REQ-900-001, REQ-900-002"),
        decl("design", "REQ-900-003,REQ-900-004"),
      ].join("\n");
      const { declarations, issues } = parseDeclarations("a.md", content);
      expect(issues).toEqual([]);
      expect(declarations).toHaveLength(3);
      expect(declarations[0]).toEqual({
        role: "implementation",
        reqIds: ["REQ-900-001"],
        file: "a.md",
        line: 1,
        source: "inline",
        sourceFile: "a.md",
      });
      expect(declarations[1]?.reqIds).toEqual(["REQ-900-001", "REQ-900-002"]);
      expect(declarations[2]?.reqIds).toEqual(["REQ-900-003", "REQ-900-004"]);
    });

    it("TIM 4役割（decision / design / implementation / verification）の宣言を解析する（TS-001）", () => {
      const content = [
        decl("decision", "REQ-900-001"),
        decl("design", "REQ-900-001"),
        decl("implementation", "REQ-900-001"),
        decl("verification", "REQ-900-001"),
      ].join("\n");
      const { declarations, issues } = parseDeclarations("four-roles.md", content);
      expect(issues).toEqual([]);
      expect(declarations).toHaveLength(4);
      expect(declarations.map((d) => d.role)).toEqual([
        "decision",
        "design",
        "implementation",
        "verification",
      ]);
    });

    it("4役割の完全性規則を機械判定する（decision 0件は不合格にしない、TS-001）", () => {
      // decision 役割を1件も含まない完全充足コーパス。decision 0件のみを理由に
      // 不合格としない（REQ-012-028、REQ-012-036）。
      const KNOWN = ["REQ-900-001", "REQ-900-002"];
      const write = (rel: string, lines: readonly string[]) => {
        const filePath = join(TEMP_ROOT, rel);
        mkdirSync(join(filePath, ".."), { recursive: true });
        writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
      };
      write("completeness/design.md", [decl("design", "REQ-900-001, REQ-900-002")]);
      write("completeness/impl.ts", [`// ${MARKER}(implementation): REQ-900-001, REQ-900-002`]);
      write("completeness/verify.test.ts", [`// ${MARKER}(verification): REQ-900-001, REQ-900-002`]);
      const scan = scanCorpus(TEMP_ROOT);
      expect(scan.declarations.some((d) => d.role === "decision")).toBe(false);
      const report = runChecks(scan, KNOWN, { completenessReqIds: KNOWN });
      expect(report.checks["missing-design"].status).toBe("pass");
      expect(report.checks["missing-implementation"].status).toBe("pass");
      expect(report.checks["missing-verification"].status).toBe("pass");
      // Decision 欠落を計上する検査項目は存在しない
      expect(Object.keys(report.checks).some((k) => k.includes("decision"))).toBe(false);
    });

    it("4桁第1セグメントの宣言行を単一ID・カンマ区切りリストともに解析する（第2セグメントは3桁維持）", () => {
      const content = [
        decl("implementation", "REQ-0039-002"),
        decl("verification", "REQ-0039-002, REQ-1234-011"),
      ].join("\n");
      const { declarations, issues } = parseDeclarations("wide.md", content);
      expect(issues).toEqual([]);
      expect(declarations).toHaveLength(2);
      expect(declarations[0]).toEqual({
        role: "implementation",
        reqIds: ["REQ-0039-002"],
        file: "wide.md",
        line: 1,
        source: "inline",
        sourceFile: "wide.md",
      });
      expect(declarations[1]?.reqIds).toEqual(["REQ-0039-002", "REQ-1234-011"]);
    });

    it("CRLF 行末でも解析できる", () => {
      const content = decl("implementation", "REQ-900-001").replaceAll("\n", "") + "\r\n" + decl("verification", "REQ-900-001") + "\r\n";
      const { declarations } = parseDeclarations("crlf.md", content);
      expect(declarations).toHaveLength(2);
      expect(declarations.every((d) => !d.reqIds.some((id) => id.includes("\r")))).toBe(true);
    });

    it("同一ファイルの複数宣言行を和集合として返す", () => {
      const content = [
        decl("implementation", "REQ-900-001"),
        decl("implementation", "REQ-900-002"),
        decl("verification", "REQ-900-001"),
      ].join("\n");
      const { declarations } = parseDeclarations("union.md", content);
      expect(declarations).toHaveLength(3);
      const reqIds = new Set(declarations.flatMap((d) => d.reqIds));
      expect([...reqIds].sort()).toEqual(["REQ-900-001", "REQ-900-002"]);
    });

    it("説明文のプレースホルダ表記を宣言として扱わない", () => {
      const content = `宣言形式: \`${MARKER}(<role>): <REQ-ID>{, <REQ-ID>}*\` の説明。`;
      const { declarations, issues } = parseDeclarations("doc.md", content);
      expect(declarations).toEqual([]);
      expect(issues).toEqual([]);
    });

    it("covers 以外の関係マーカーを扱わない", () => {
      const otherMarker = ["ADF", "-", "DEPENDS", "-", "ON"].join("");
      const content = `<!-- ${otherMarker}(design): REQ-900-001 -->`;
      const { declarations, issues } = parseDeclarations("other.md", content);
      expect(declarations).toEqual([]);
      expect(issues).toEqual([]);
    });

    it("正規位置の既知ロールで宣言形式を満たさない行を malformed-declaration として検出する", () => {
      const cases = [
        `<!-- ${MARKER}(design) REQ-900-001 -->`,          // コロンなし
        `<!-- ${MARKER}(design): REQ900-001 -->`,          // ID 形式違反
        `<!-- ${MARKER}(design): -->`,                     // ID 空
        `<!-- ${MARKER}(implementation): REQ-900- -->`,   // 空セグメント
      ];
      for (let i = 0; i < cases.length; i++) {
        const { declarations, issues } = parseDeclarations(`m${i}.md`, cases[i]!);
        expect(declarations).toEqual([]);
        expect(issues).toHaveLength(1);
        expect(issues[0]?.kind).toBe("malformed-declaration");
        expect(issues[0]?.line).toBe(1);
      }
    });

    it("本文 prose 内の宣言形状言及（完全形式・形式不備とも）は対象外とする", () => {
      const content = [
        "## 宣言の書き方",
        "",
        `宣言は ${MARKER}(implementation): REQ-900-001 の形式で書く。`,
        `形式不備の例: ${MARKER}(design) REQ-900-001`,
        `- 箇条書きでも ${MARKER}(verification): REQ-900-001, REQ-900-002 と書ける。`,
      ].join("\n");
      const { declarations, issues } = parseDeclarations("prose.md", content);
      expect(declarations).toEqual([]);
      expect(issues).toEqual([]);
    });

    it("prose 言及と正規位置の形式不備宣言が混在しても prose は無視し、malformed-declaration は検出し続ける", () => {
      const content = [
        `説明文で ${MARKER}(implementation): REQ-900-001 と形状を言及する。`,
        `<!-- ${MARKER}(design): REQ900-001 -->`,
      ].join("\n");
      const { declarations, issues } = parseDeclarations("mixed.md", content);
      expect(declarations).toEqual([]);
      expect(issues).toHaveLength(1);
      expect(issues[0]?.kind).toBe("malformed-declaration");
      expect(issues[0]?.line).toBe(2);
    });

    it("prose 言及と正規位置の完全形式宣言が混在する場合、正規位置のみ宣言として計上する", () => {
      const content = [
        `${MARKER}(implementation): REQ-900-999 という形状の説明。`,
        `<!-- ${MARKER}(implementation): REQ-900-001 -->`,
      ].join("\n");
      const { declarations, issues } = parseDeclarations("mixed2.md", content);
      expect(issues).toEqual([]);
      expect(declarations).toHaveLength(1);
      expect(declarations[0]?.reqIds).toEqual(["REQ-900-001"]);
      expect(declarations[0]?.line).toBe(2);
    });

    it("TypeScript のコード行内の形状言及は対象外とし、行頭コメント内の形式不備は検出する", () => {
      const content = [
        `const shape = "${MARKER}(design): REQ-900-001";`,
        `// ${MARKER}(design): REQ900-001`,
      ].join("\n");
      const { declarations, issues } = parseDeclarations("code.ts", content);
      expect(declarations).toEqual([]);
      expect(issues).toHaveLength(1);
      expect(issues[0]?.kind).toBe("malformed-declaration");
      expect(issues[0]?.line).toBe(2);
    });

    it("未知の成果物役割を unknown-role として検出する", () => {
      const content = decl("review", "REQ-900-001");
      const { declarations, issues } = parseDeclarations("u.md", content);
      expect(declarations).toEqual([]);
      expect(issues).toHaveLength(1);
      expect(issues[0]?.kind).toBe("unknown-role");
    });

    it("宣言の行位置（1-based）を根拠として保持する", () => {
      const content = ["# 見出し", "", decl("implementation", "REQ-900-001")].join("\n");
      const { declarations } = parseDeclarations("line.md", content);
      expect(declarations[0]?.line).toBe(3);
    });
  });

  describe("配置と構造（REQ-012-043、REQ-012-050）", () => {
    it("配布スキルが src/common/skills/agentdev-traceability/ に配置されている", async () => {
      const mod = await import(
        "../../../../skills/agentdev-traceability/scripts/lib/declarations.ts"
      );
      const modulePath = import.meta.resolve(
        "../../../../skills/agentdev-traceability/scripts/lib/declarations.ts",
      ).replaceAll("\\", "/");
      expect(modulePath).toContain("src/common/skills/agentdev-traceability/scripts/lib/declarations.ts");
      // artifact-graph を新しい標準機能名として引き継いでいない
      expect(modulePath).not.toContain("agentdev-artifact-graph");
      expect(typeof mod.parseDeclarations).toBe("function");
    });

    it("解析コアが query/check から独立したモジュールとして分離されている（キャッシュ追加可能構造）", async () => {
      const mod = await import(
        "../../../../skills/agentdev-traceability/scripts/lib/declarations.ts"
      );
      const exports = Object.keys(mod).sort();
      // 解析コアは解析のみを担い、走査・問い合わせ・検査の関数を持たない
      expect(exports).toEqual(["COVER_ROLES", "parseDeclarations"]);
      const query = await import(
        "../../../../skills/agentdev-traceability/scripts/lib/query.ts"
      );
      expect(Object.keys(query).some((k) => k.toLowerCase().includes("declar"))).toBe(false);
    });

    it("テストソースの組立ヘルパー行自体は宣言として誤検出されない", () => {
      const self = readFileSync(join(import.meta.dir, "traceability_core.test.ts"), "utf-8");
      const { issues } = parseDeclarations("self.ts", self);
      // テンプレートリテラルのプレースホルダは識別子形式を満たさない
      expect(issues.filter((i) => i.kind === "malformed-declaration")).toEqual([]);
      expect(issues.filter((i) => i.kind === "unknown-role")).toEqual([]);
    });
  });
});

describe("隣接工程間対応（links）", () => {
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
});

describe("sidecar 読込と種別非依存走査", () => {
  // sidecar 読込と種別非依存走査の検証。top-level traceability/ 配下の
  // component / package 単位 sidecar が artifact パス・role・要件行 ID のみの最小データで
  // 対応関係を解決できること（専用 ID・digest 不在でエラーにならない）、.md / .ts 以外の
  // 拡張子を持つ成果物が sidecar から参照され拡張子フィルタで除外されないこと、
  // policy.yaml が sidecar 走査から除外されることを検証する。
  // verification 対応は導出規約（traceability/derivations.yaml）が
  // import 実測から導出する（lib/sidecar.ts・lib/corpus.ts・lib/check.ts の対応宣言）。

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

  describe("sidecar の最小データ読込", () => {
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

  describe("種別非依存の対応関係", () => {
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

  describe("sidecar の解析（parseSidecar 単体）", () => {
    it("最小データ（artifact パス、role、要件行 ID のみ）で対応関係を正規化する", () => {
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
});

describe("REQ-117-006: sidecar 重複キーの機械検出（重複キー異常系の維持観点）", () => {
  // traceability sidecar 重複キー検出の回帰テスト（REQ-117-006・AG-006 (a)）。
  //
  // Bun.YAML の last-wins 解釈では重複キーの shadow 義務が黙って失われるため、
  // parse 前の raw parse（行ベース走査）で重複キーを issues として検出できることを
  // 検証する。PR #3819 相当の重複が再発時に検出されることを目標とする。
  // REQ-117-006 の達成状態維持のため、本セクションは統合後も欠落させてはならない。

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

describe("対応宣言導出機構", () => {
  // 対応宣言導出機構の検証。
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
});

describe("棚卸し（inventory）", () => {
  // 棚卸し（inventory）能力の検証。対応関係: REQ-107-003（sidecar 正規配置・
  // traceability/agentdev-traceability.yaml）。
  //
  // - 正規成果物を宣言済みの対応関係と独立に直接走査で棚卸しし、宣言外の
  //   実在成果物・追跡候補を発見候補として扱えること
  // - 発見候補は advisory であり、対応関係の欠落と誤判定しないこと
  // - covers と links のいずれの宣言にも現れる成果物は発見候補から除外されること

  const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
  const RUN_ID = `trace-inventory-${crypto.randomUUID().slice(0, 8)}`;
  const ROOT = join(TEMP_BASE, RUN_ID);

  function writeFixture(rel: string, lines: readonly string[]): void {
    const filePath = join(ROOT, rel);
    mkdirSync(join(filePath, ".."), { recursive: true });
    writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
  }

  beforeAll(() => {
    mkdirSync(ROOT, { recursive: true });
    writeFixture("docs/requirements/REQ-901.md", [
      "| ID | 要件 |",
      "|---|---|",
      "| REQ-900-301 | 例 |",
    ]);
    // covers 宣言済みの成果物
    writeFixture("docs/designs/inv-spec.md", ["# 設計"]);
    writeFixture("traceability/inv-component.yaml", [
      "component: inv-component",
      "design:",
      "  docs/designs/inv-spec.md:",
      "    - REQ-900-301",
    ]);
    // links 宣言済みの成果物（covers には現れない）
    writeFixture("src/inv-linked.ts", ["// ADF-LINKS(upstream): docs/designs/inv-spec.md"]);
    // 宣言外の実在成果物（発見候補）
    writeFixture("docs/designs/undeclared-artifact.md", ["# 宣言外の成果物"]);
  });
  afterAll(() => {
    rmSync(ROOT, { recursive: true, force: true });
  });

  describe("棚卸しと発見候補（REQ-107-003）", () => {
    it("宣言済み対応関係と独立に直接走査し、宣言外の実在成果物を発見候補として返す", () => {
      const inventory = buildInventory(ROOT);
      expect(inventory.corpusArtifacts).toContain("docs/designs/undeclared-artifact.md");
      expect(inventory.discoveredCandidates).toEqual(["docs/designs/undeclared-artifact.md"]);
      expect(inventory.emptyResult).toBe(false);
    });

    it("covers 宣言済みと links 宣言済みの成果物は発見候補から除外される", () => {
      const inventory = buildInventory(ROOT);
      expect(inventory.discoveredCandidates).not.toContain("docs/designs/inv-spec.md");
      expect(inventory.discoveredCandidates).not.toContain("src/inv-linked.ts");
      expect(inventory.declaredArtifacts).toContain("docs/designs/inv-spec.md");
      expect(inventory.linkedArtifacts).toContain("src/inv-linked.ts");
      expect(inventory.linkedArtifacts).toContain("docs/designs/inv-spec.md");
    });

    it("発見候補は advisory であり対応関係の欠落として判定しない", () => {
      const inventory = buildInventory(ROOT);
      // note が欠落と誤判定しない旨を保持する（advisory・候補提供の明示）
      expect(inventory.note).toContain("欠落を意味しない");
      // 発見候補の存在は check を不合格にしない
      const scan = scanCorpus(ROOT);
      const report = runChecks(scan, currentRequirementLineIds(ROOT), { completenessReqIds: ["REQ-900-301"] });
      expect(report.checks["missing-design"].findings).toEqual([]);
    });
  });
});

describe("証拠再利用（reuse）", () => {
  // 証拠再利用確認（reuse）能力の検証。対応関係: REQ-107-008（sidecar 正規配置・
  // traceability/agentdev-traceability.yaml）。
  //
  // - 変更前の証拠を再利用する場合、その証拠が現在の対象に構造的に到達できるかを
  //   確認し、証拠自身の対応関係と links の双方向を列挙できること
  // - 版・条件の適合は意味的品質検証であり、本確認は合格判定を返さず
  //   manualConfirmation に確認事項を明示すること

  const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
  const RUN_ID = `trace-reuse-${crypto.randomUUID().slice(0, 8)}`;
  const ROOT = join(TEMP_BASE, RUN_ID);

  function writeFixture(rel: string, lines: readonly string[]): void {
    const filePath = join(ROOT, rel);
    mkdirSync(join(filePath, ".."), { recursive: true });
    writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
  }

  // フィクスチャ用の covers 宣言行生成。テストソース内にマーカー文字列を直接記述すると
  // TIM コーパス走査（.ts 拡張子走査）で実宣言として誤検出されるため、
  // テンプレート埋め込み経由で組み立てる。
  function decl(role: string, ids: string): string {
    return `<!-- ADF-COVERS(${role}): ${ids} -->`;
  }

  beforeAll(() => {
    mkdirSync(ROOT, { recursive: true });
    // 証拠成果物（covers 宣言 + links 宣言を保持する）
    writeFixture("docs/reports-archived/prior-run.md", [
      "# 前回検証記録",
      decl("verification", "REQ-900-401"),
      "<!-- ADF-LINKS(upstream): docs/designs/ru-spec.md -->",
    ]);
    // 証拠の上流成果物
    writeFixture("docs/designs/ru-spec.md", ["# 設計"]);
    // 証拠を上流として参照する下流成果物
    writeFixture("src/consumer.ts", [
      "// ADF-LINKS(upstream): docs/reports-archived/prior-run.md",
      "export const y = 2;",
    ]);
    // 証拠が対応する要件行
    writeFixture("docs/requirements/REQ-900d.md", [
      "| ID | 要件 |",
      "|---|---|",
      "| REQ-900-401 | 例 |",
    ]);
  });
  afterAll(() => {
    rmSync(ROOT, { recursive: true, force: true });
  });

  describe("証拠再利用の構造的適用可否確認（REQ-107-008）", () => {
    it("実在証拠の構造確認と対応関係列挙を行い、版を記録する", () => {
      const result = evaluateEvidenceReuse(ROOT, "docs/reports-archived/prior-run.md", "1a3575149f838093e5b5ac80e395ceb662beb506");
      expect(result.exists).toBe(true);
      expect(result.structuralStatus).toBe("confirmed");
      expect(result.revision).toBe("1a3575149f838093e5b5ac80e395ceb662beb506");
      expect(result.declaredRelations).toEqual([
        { role: "verification", reqIds: ["REQ-900-401"] },
      ]);
      expect(result.upstreamArtifacts).toEqual(["docs/designs/ru-spec.md"]);
      expect(result.downstreamArtifacts).toEqual(["src/consumer.ts"]);
    });

    it("不在証拠を evidence-not-found として報告する", () => {
      const result = evaluateEvidenceReuse(ROOT, "docs/reports-archived/gone.md");
      expect(result.exists).toBe(false);
      expect(result.existsReason).toBe("file-not-found");
      expect(result.structuralStatus).toBe("evidence-not-found");
      expect(result.declaredRelations).toEqual([]);
    });

    it("適用可否の合格判定を返さず、版・条件の確認事項を manualConfirmation に明示する", () => {
      const result = evaluateEvidenceReuse(ROOT, "docs/reports-archived/prior-run.md");
      // 構造検査の confirmed は適用可否の合格ではない
      expect(result.structuralStatus).toBe("confirmed");
      expect(result.manualConfirmation.length).toBeGreaterThan(0);
      const joined = result.manualConfirmation.join("\n");
      expect(joined).toContain("版の適合");
      expect(joined).toContain("条件の適合");
      expect(result.note).toContain("合格判定しない");
    });
  });
});
