// ADF-COVERS(verification): REQ-012-043, REQ-012-050
//
// agentdev-traceability 配布スキルの ADF-COVERS 対応宣言の解析仕様検証
// （行単位パターン照合、和集合、意味推定なし）と配置・構造
// （lib 解析コアと CLI の分離）の検証（OU-002、Issue #2360）。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { parseDeclarations } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/declarations.ts";

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
    });
    expect(declarations[1]?.reqIds).toEqual(["REQ-900-001", "REQ-900-002"]);
    expect(declarations[2]?.reqIds).toEqual(["REQ-900-003", "REQ-900-004"]);
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

  it("既知ロールで宣言形式を満たさない行を malformed-declaration として検出する", () => {
    const cases = [
      `${MARKER}(design) REQ-900-001`,          // コロンなし
      `${MARKER}(design): REQ900-001`,          // ID 形式違反
      `${MARKER}(design):`,                     // ID 空
      `${MARKER}(implementation): REQ-900-1`,   // 桁数不足
    ];
    for (let i = 0; i < cases.length; i++) {
      const { declarations, issues } = parseDeclarations(`m${i}.md`, cases[i]!);
      expect(declarations).toEqual([]);
      expect(issues).toHaveLength(1);
      expect(issues[0]?.kind).toBe("malformed-declaration");
      expect(issues[0]?.line).toBe(1);
    }
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
