// ADF-COVERS(verification): REQ-012-043, REQ-012-050
//
// agentdev-traceability 配布スキルの ADF-COVERS 対応宣言の解析仕様検証
// （行単位パターン照合、和集合、意味推定なし）と配置・構造
// （lib 解析コアと CLI の分離）、および TIM 4役割（decision / design /
// implementation / verification）の解析（TS-001、DEC-030 決定1）を検証する。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseDeclarations } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/declarations.ts";
import { scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-decls-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

// フィクスチャ用の宣言行生成。テストソース内に完成形のマーカー文字列を直接
// 記述すると実リポジトリのコーパス走査で実宣言として誤検出されるため、
// マーカーはパーツ結合経由で組み立てる。
const MARKER = ["ADF", "-", "COVERS"].join("");
function decl(role: string, ids: string): string {
  return `<!-- ${MARKER}(${role}): ${ids} -->`;
}

describe("対応宣言の解析", () => {
  beforeAll(() => {
    mkdirSync(TEMP_ROOT, { recursive: true });
  });
  afterAll(() => {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
  });

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
      `<!-- ${MARKER}(implementation): REQ-900-1 -->`,   // 桁数不足
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
  it("配布スキルが src/opencode/skills/agentdev-traceability/ に配置されている", async () => {
    const mod = await import(
      "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/declarations.ts"
    );
    const modulePath = import.meta.resolve(
      "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/declarations.ts",
    ).replaceAll("\\", "/");
    expect(modulePath).toContain("src/opencode/skills/agentdev-traceability/scripts/lib/declarations.ts");
    // artifact-graph を新しい標準機能名として引き継いでいない
    expect(modulePath).not.toContain("agentdev-artifact-graph");
    expect(typeof mod.parseDeclarations).toBe("function");
  });

  it("解析コアが query/check から独立したモジュールとして分離されている（キャッシュ追加可能構造）", async () => {
    const mod = await import(
      "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/declarations.ts"
    );
    const exports = Object.keys(mod).sort();
    // 解析コアは解析のみを担い、走査・問い合わせ・検査の関数を持たない
    expect(exports).toEqual(["COVER_ROLES", "parseDeclarations"]);
    const query = await import(
      "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/query.ts"
    );
    expect(Object.keys(query).some((k) => k.toLowerCase().includes("declar"))).toBe(false);
  });

  it("テストソースの組立ヘルパー行自体は宣言として誤検出されない", () => {
    const self = readFileSync(join(import.meta.dir, "traceability_declarations.test.ts"), "utf-8");
    const { issues } = parseDeclarations("self.ts", self);
    // テンプレートリテラルのプレースホルダは識別子形式を満たさない
    expect(issues.filter((i) => i.kind === "malformed-declaration")).toEqual([]);
    expect(issues.filter((i) => i.kind === "unknown-role")).toEqual([]);
  });
});
