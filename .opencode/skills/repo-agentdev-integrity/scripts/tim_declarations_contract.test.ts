// ADF-COVERS(verification): REQ-012-026, REQ-012-027, REQ-012-028, REQ-012-029, REQ-012-030, REQ-012-031, REQ-012-032, REQ-012-033, REQ-012-034, REQ-012-035, REQ-012-036, REQ-012-037, REQ-012-038, REQ-012-039, REQ-012-040, REQ-012-041, REQ-012-042
//
// TIM 対応宣言（docs/designs/foundations/v4-traceability-model.md）のコーパス契約検証。旧 traceability-model.md は Case #3004 第7段で supersede 物理削除済み。
// DEC-030（4役割・Decision 任意・Design 必須）に従い恒常的に検証する。
//
// スコープ注記:
// - 完全性判定の対象は REQ-012-026〜042 に限定する。
//   全現行要件行への対応付け拡大は棚卸し移行、判定機能の一般化は
//   agentdev-traceability スキル実装（Wave 2-1）の責務であり、本テストはその完了を前提としない。
// - 解析は agentdev-traceability.md「対応関係データの取得と正規化」の行単位パターン照合に従う。
//   意味推定は行わず、マーカー文字列 ADF-COVERS(...) のみを手がかりにする。
// - 対応関係の標準保存方式は traceability/ 配下 sidecar（DEC-030 決定3）であり、
//   inline 宣言は producer 側成果物のための直列化形式（REQ-012-054）である。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { findRepoRoot } from "./cli_utils.ts";

const SCRIPT_DIR = import.meta.dir;
const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `tim-decls-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

// OU-001 完了条件の対象要件行（REQ-012-026〜042）。
const OU001_SCOPE: readonly string[] = Array.from(
  { length: 17 },
  (_, i) => `REQ-012-${String(26 + i).padStart(3, "0")}`,
);

// ─── 対応宣言の解析（行単位パターン照合） ───────────────────────────────────

type CoverRole = "decision" | "design" | "implementation" | "verification";

interface CoverDeclaration {
  readonly role: CoverRole;
  readonly reqIds: readonly string[];
  readonly file: string;
}

interface ParseIssue {
  readonly kind: "unknown-role";
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

const DECLARATION_RE =
  /ADF-COVERS\((decision|design|implementation|verification)\):\s*(REQ-\d{3}-\d{3}(?:\s*,\s*REQ-\d{3}-\d{3})*)/;
const ROLE_PROBE_RE = /ADF-COVERS\(([A-Za-z][A-Za-z-]*)\):/;
const KNOWN_ROLES: readonly string[] = ["decision", "design", "implementation", "verification"];

// フィクスチャ用の宣言行生成。テストソース内にマーカー文字列を直接記述すると
// コーパス走査（本ファイル自身を含む）で実宣言として誤検出されるため、
// テンプレート埋め込み経由で組み立てる。
function decl(role: string, ids: string): string {
  return `<!-- ADF-COVERS(${role}): ${ids} -->`;
}

function parseDeclarations(
  file: string,
  content: string,
): { declarations: CoverDeclaration[]; issues: ParseIssue[] } {
  const declarations: CoverDeclaration[] = [];
  const issues: ParseIssue[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/\r$/, "");
    const m = raw.match(DECLARATION_RE);
    if (m) {
      declarations.push({
        role: m[1] as CoverRole,
        reqIds: m[2].split(/\s*,\s*/),
        file,
      });
      continue;
    }
    const probe = raw.match(ROLE_PROBE_RE);
    if (probe && !KNOWN_ROLES.includes(probe[1])) {
      issues.push({ kind: "unknown-role", file, line: i + 1, text: raw.trim() });
    }
  }
  return { declarations, issues };
}

// ─── 対応関係の完全性規則（v4-traceability-model.md 吸収節「対応関係の完全性規則」の判定器） ───

interface CompletenessEntry {
  readonly reqId: string;
  readonly decision: number;
  readonly design: number;
  readonly implementation: number;
  readonly verification: number;
  readonly complete: boolean;
  readonly missing: readonly ("design" | "implementation" | "verification")[];
}

function judgeCompleteness(
  declarations: readonly CoverDeclaration[],
  reqIds: readonly string[],
): CompletenessEntry[] {
  return reqIds.map((reqId) => {
    const count = (role: CoverRole): number =>
      declarations.filter((d) => d.role === role && d.reqIds.includes(reqId)).length;
    const design = count("design");
    const implementation = count("implementation");
    const verification = count("verification");
    // Decision 対応は件数を数えるが完全性判定には使わない（任意対応、DEC-030 決定1）。
    // Decision 対応0件のみを理由に不完全としない。
    // Design 対応・実装対応・検証対応（policy required 行）は必須対応。
    // Design 対応を経由して実装対応・検証対応の成立を推定しない（推移阻止）。
    const missing: ("design" | "implementation" | "verification")[] = [];
    if (design === 0) missing.push("design");
    if (implementation === 0) missing.push("implementation");
    if (verification === 0) missing.push("verification");
    return {
      reqId,
      decision: count("decision"),
      design,
      implementation,
      verification,
      complete: missing.length === 0,
      missing,
    };
  });
}

function findUnknownReqRefs(
  declarations: readonly CoverDeclaration[],
  knownIds: readonly string[],
): { file: string; reqId: string }[] {
  const known = new Set(knownIds);
  const unknown: { file: string; reqId: string }[] = [];
  for (const d of declarations) {
    for (const id of d.reqIds) {
      if (!known.has(id)) unknown.push({ file: d.file, reqId: id });
    }
  }
  return unknown;
}

// ─── 正規成果物コーパスの収集（直接走査。派生索引、グラフDBを前提としない） ───

function walkFiles(dir: string, exts: readonly string[], out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walkFiles(full, exts, out);
    } else if (exts.some((e) => name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

function corpusFiles(): string[] {
  const docs = walkFiles(join(REPO_ROOT, "docs"), [".md"]);
  const scripts = walkFiles(SCRIPT_DIR, [".ts"]);
  return [...docs, ...scripts];
}

function currentRequirementLineIds(): string[] {
  const reqDir = join(REPO_ROOT, "docs", "requirements");
  const ids: string[] = [];
  for (const name of readdirSync(reqDir)) {
    if (!/^REQ-\d{3}\.md$/.test(name)) continue;
    const content = readFileSync(join(reqDir, name), "utf-8");
    for (const raw of content.split("\n")) {
      const m = raw.match(/^\|\s*(REQ-\d{3}-\d{3})\s*\|/);
      if (m) ids.push(m[1]);
    }
  }
  return ids;
}

function parseCorpus(): { declarations: CoverDeclaration[]; issues: ParseIssue[] } {
  const declarations: CoverDeclaration[] = [];
  const issues: ParseIssue[] = [];
  for (const file of corpusFiles()) {
    const rel = relative(REPO_ROOT, file).replace(/\\/g, "/");
    const parsed = parseDeclarations(rel, readFileSync(file, "utf-8"));
    declarations.push(...parsed.declarations);
    issues.push(...parsed.issues);
  }
  return { declarations, issues };
}

// ─── 実リポジトリコーパスの検証 ─────────────────────────────────────────────

describe("TIM 対応宣言コーパス（実リポジトリ）", () => {
  it("REQ-012-026〜042 の各要件行へ実装対応が1件以上保存されている（完了条件）", () => {
    const { declarations } = parseCorpus();
    const entries = judgeCompleteness(declarations, OU001_SCOPE);
    const lacking = entries.filter((e) => e.implementation === 0).map((e) => e.reqId);
    expect(lacking).toEqual([]);
  });

  it("REQ-012-026〜042 の各要件行へ Design 対応が1件以上保存されている（DEC-030 決定1）", () => {
    const { declarations } = parseCorpus();
    const entries = judgeCompleteness(declarations, OU001_SCOPE);
    const lacking = entries.filter((e) => e.design === 0).map((e) => e.reqId);
    expect(lacking).toEqual([]);
  });

  it("REQ-012-026〜042 の各要件行へ検証対応が1件以上保存されている（完了条件）", () => {
    const { declarations } = parseCorpus();
    const entries = judgeCompleteness(declarations, OU001_SCOPE);
    const lacking = entries.filter((e) => e.verification === 0).map((e) => e.reqId);
    expect(lacking).toEqual([]);
  });

  it("コーパス内の全参照要件IDが現行 REQ ファイルの要件行として存在する", () => {
    const { declarations } = parseCorpus();
    const unknown = findUnknownReqRefs(declarations, currentRequirementLineIds());
    expect(unknown).toEqual([]);
  });

  it("コーパス内に未知の成果物役割を持つ宣言が存在しない（REQ-012-028/040）", () => {
    const { issues } = parseCorpus();
    expect(issues).toEqual([]);
  });

  it("1つの成果物が複数の役割を持てる（v4-traceability-model.md の design と implementation）", () => {
    const { declarations } = parseCorpus();
    const fromModel = declarations.filter((d) => d.file.endsWith("foundations/v4-traceability-model.md"));
    const roles = new Set(fromModel.map((d) => d.role));
    expect(roles.has("design")).toBe(true);
    expect(roles.has("implementation")).toBe(true);
  });

  it("複数の成果物が同一要件行へ対応できる（REQ-012-042 の実装対応2件）", () => {
    const { declarations } = parseCorpus();
    const files = declarations
      .filter((d) => d.role === "implementation" && d.reqIds.includes("REQ-012-042"))
      .map((d) => d.file);
    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  it("Design status が accepted へ昇格している（完了条件1: frontmatter と designs/README.md status 列）", () => {
    const model = readFileSync(
      join(REPO_ROOT, "docs", "designs", "foundations", "v4-traceability-model.md"),
      "utf-8",
    );
    expect(model).toMatch(/^status: accepted$/m);
    const readme = readFileSync(join(REPO_ROOT, "docs", "designs", "README.md"), "utf-8");
    expect(readme).toContain("| foundations/v4-traceability-model.md | accepted |");
  });

  it("更新対象の規範文書で coverage の直訳語を正式用語として使用していない（用語政策）", () => {
    const targets = [
      join(REPO_ROOT, "docs", "requirements", "REQ-012.md"),
      join(REPO_ROOT, "docs", "designs", "foundations", "v4-traceability-model.md"),
      join(REPO_ROOT, "docs", "designs", "skills", "agentdev-traceability.md"),
      join(REPO_ROOT, "docs", "designs", "README.md"),
    ];
    for (const t of targets) {
      const content = readFileSync(t, "utf-8");
      expect(content.includes("カバレッジ")).toBe(false);
      expect(content.includes("被覆")).toBe(false);
    }
  });
});

// ─── モデル規則の検証（フィクスチャによる正常系・異常系・境界・推移誤判定防止） ───

describe("TIM モデル規則（フィクスチャ）", () => {
  beforeAll(() => {
    mkdirSync(TEMP_ROOT, { recursive: true });
  });
  afterAll(() => {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
  });

  const KNOWN: readonly string[] = ["REQ-900-001", "REQ-900-002", "REQ-900-003"];

  function writeFixture(name: string, lines: readonly string[]): string {
    const filePath = join(TEMP_ROOT, name);
    writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
    return filePath;
  }

  function parseFiles(files: readonly string[]): CoverDeclaration[] {
    return files.flatMap((f) => parseDeclarations(f, readFileSync(f, "utf-8")).declarations);
  }

  it("正常系: Design・実装・検証対応が各1件以上なら完全性を満たすと判定する", () => {
    const d = writeFixture("ok-design.md", [decl("design", "REQ-900-001")]);
    const a = writeFixture("ok-impl.md", [decl("implementation", "REQ-900-001")]);
    const b = writeFixture("ok-verify.md", [decl("verification", "REQ-900-001")]);
    const [entry] = judgeCompleteness(parseFiles([d, a, b]), ["REQ-900-001"]);
    expect(entry.complete).toBe(true);
    expect(entry.missing).toEqual([]);
  });

  it("Decision 対応が0件でも、それだけを理由に不完全と判定しない（DEC-030 決定1）", () => {
    const d = writeFixture("no-decision-design.md", [decl("design", "REQ-900-001")]);
    const a = writeFixture("no-decision-impl.md", [decl("implementation", "REQ-900-001")]);
    const b = writeFixture("no-decision-verify.md", [decl("verification", "REQ-900-001")]);
    const [entry] = judgeCompleteness(parseFiles([d, a, b]), ["REQ-900-001"]);
    expect(entry.decision).toBe(0);
    expect(entry.complete).toBe(true);
  });

  it("Design 対応が0件の場合、Design 対応の欠落として個別に検出する（DEC-030 決定1）", () => {
    const a = writeFixture("missing-design-impl.md", [decl("implementation", "REQ-900-001")]);
    const b = writeFixture("missing-design-verify.md", [decl("verification", "REQ-900-001")]);
    const [entry] = judgeCompleteness(parseFiles([a, b]), ["REQ-900-001"]);
    expect(entry.complete).toBe(false);
    expect(entry.missing).toEqual(["design"]);
  });

  it("実装対応が0件の場合、実装対応の欠落として個別に検出する（異常系）", () => {
    const d = writeFixture("missing-impl-design.md", [decl("design", "REQ-900-001")]);
    const b = writeFixture("missing-impl-verify.md", [decl("verification", "REQ-900-001")]);
    const [entry] = judgeCompleteness(parseFiles([d, b]), ["REQ-900-001"]);
    expect(entry.complete).toBe(false);
    expect(entry.missing).toEqual(["implementation"]);
  });

  it("検証対応が0件の場合、検証対応の欠落として個別に検出する（異常系）", () => {
    const d = writeFixture("missing-verif-design.md", [decl("design", "REQ-900-001")]);
    const a = writeFixture("missing-verif-impl.md", [decl("implementation", "REQ-900-001")]);
    const [entry] = judgeCompleteness(parseFiles([d, a]), ["REQ-900-001"]);
    expect(entry.complete).toBe(false);
    expect(entry.missing).toEqual(["verification"]);
  });

  it("Design 対応のみの要件を実装済みまたは検証済みと判定しない（推移誤判定防止）", () => {
    const d = writeFixture("transitive-design.md", [decl("design", "REQ-900-001")]);
    const [entry] = judgeCompleteness(parseFiles([d]), ["REQ-900-001"]);
    expect(entry.design).toBe(1);
    expect(entry.implementation).toBe(0);
    expect(entry.verification).toBe(0);
    expect(entry.complete).toBe(false);
    expect(entry.missing).toEqual(["implementation", "verification"]);
  });

  it("1成果物から複数要件、複数成果物から1要件の双方を表現できる（境界）", () => {
    const x = writeFixture("multi-x.md", [decl("implementation", "REQ-900-001, REQ-900-002")]);
    const y = writeFixture("multi-y.md", [decl("implementation", "REQ-900-003")]);
    const z = writeFixture("multi-z.md", [decl("implementation", "REQ-900-003")]);
    const entries = judgeCompleteness(parseFiles([x, y, z]), KNOWN);
    expect(entries.find((e) => e.reqId === "REQ-900-001")?.implementation).toBe(1);
    expect(entries.find((e) => e.reqId === "REQ-900-002")?.implementation).toBe(1);
    expect(entries.find((e) => e.reqId === "REQ-900-003")?.implementation).toBe(2);
  });

  it("1つの成果物が複数の役割を持つ場合も正常に表現できる（境界）", () => {
    const w = writeFixture("roles-w.md", [
      decl("design", "REQ-900-001"),
      decl("implementation", "REQ-900-001"),
      decl("verification", "REQ-900-001"),
    ]);
    const [entry] = judgeCompleteness(parseFiles([w]), ["REQ-900-001"]);
    expect(entry.design).toBe(1);
    expect(entry.implementation).toBe(1);
    expect(entry.verification).toBe(1);
    expect(entry.complete).toBe(true);
  });

  it("存在しない要件への対応宣言を正常な対応関係として扱わない（異常系）", () => {
    const a = writeFixture("unknown-req.md", [decl("implementation", "REQ-900-999")]);
    const declarations = parseFiles([a]);
    const unknown = findUnknownReqRefs(declarations, KNOWN);
    expect(unknown.map((u) => u.reqId)).toEqual(["REQ-900-999"]);
    const [entry] = judgeCompleteness(declarations, KNOWN);
    expect(entry.complete).toBe(false);
    expect(entry.missing).toEqual(["design", "implementation", "verification"]);
  });

  it("一般的な文書参照や言及を対応関係として扱わず、Decision 宣言がなくても判定できる", () => {
    const g = writeFixture("general-ref.md", [
      "[REQ-900-001](../requirements/REQ-900.md) へのリンクと、本文中の REQ-900-001 言及。",
    ]);
    const declarations = parseFiles([g]);
    expect(declarations).toEqual([]);
    const entries = judgeCompleteness(declarations, KNOWN);
    expect(entries).toHaveLength(3);
    expect(entries.every((e) => e.complete === false)).toBe(true);
  });

  it("decision 役割の対応宣言は unknown role ではなく受理される（DEC-030 決定1）", () => {
    const r = writeFixture("role-decision.md", [decl("decision", "REQ-900-001")]);
    const { declarations, issues } = parseDeclarations(r, readFileSync(r, "utf-8"));
    expect(issues).toEqual([]);
    expect(declarations).toHaveLength(1);
    expect(declarations[0]?.role).toBe("decision");
  });

  it("REQ-012-028/040: 未知の成果物役割を対応関係として数えず、検出する", () => {
    const r = writeFixture("role-unknown.md", [decl("review", "REQ-900-001")]);
    const { declarations, issues } = parseDeclarations(r, readFileSync(r, "utf-8"));
    expect(declarations).toEqual([]);
    expect(issues.map((i) => i.kind)).toEqual(["unknown-role"]);
  });

  it("REQ-012-034: implementation を Markdown 文書など非コード成果物が保持できる（物理種別に依存しない）", () => {
    const m = writeFixture("role-impl-doc.md", [decl("implementation", "REQ-900-001")]);
    const declarations = parseFiles([m]);
    expect(declarations).toHaveLength(1);
    expect(declarations[0]?.role).toBe("implementation");
  });

  it("REQ-012-035/038: 解析結果は役割と要件行IDのみを保持し、検証実行結果や影響方向のデータを持たない", () => {
    const m = writeFixture("shape.md", [decl("verification", "REQ-900-001, REQ-900-002")]);
    const [d] = parseFiles([m]);
    expect(Object.keys(d ?? {}).sort()).toEqual(["file", "reqIds", "role"]);
  });

  it("REQ-012-039: covers 以外の関係マーカーを対応関係として扱わない", () => {
    const n = writeFixture("non-covers.md", ["<!-- ADF-DEPENDS-ON(design): REQ-900-001 -->"]);
    const { declarations, issues } = parseDeclarations(n, readFileSync(n, "utf-8"));
    expect(declarations).toEqual([]);
    expect(issues).toEqual([]);
  });

  it("REQ-012-041: 派生索引やグラフDBを前提とせず、正規成果物の直接走査で判定が成立する", () => {
    // TEMP_ROOT は本テストが新規作成した直下のディレクトリであり、索引・キャッシュ類は存在しない。
    const f = writeFixture("direct-scan.md", [
      decl("design", "REQ-900-001"),
      decl("implementation", "REQ-900-001"),
      decl("verification", "REQ-900-001"),
    ]);
    const declarations = parseFiles([f]);
    const [entry] = judgeCompleteness(declarations, ["REQ-900-001"]);
    expect(entry.complete).toBe(true);
  });

  it("要件行 REQ-{NNNN}-{MMM} 形式のみを判定単位として解釈する（REQ-012-026）", () => {
    const good = writeFixture("line-id-good.md", [
      decl("design", "REQ-900-001"),
      decl("implementation", "REQ-900-001"),
      decl("verification", "REQ-900-001"),
    ]);
    const bad = writeFixture("line-id-bad.md", [
      decl("implementation", "REQ-900"),
      decl("verification", "REQ-900-1"),
    ]);
    const goodDecls = parseFiles([good]);
    const [entry] = judgeCompleteness(goodDecls, ["REQ-900-001"]);
    expect(entry.complete).toBe(true);
    const badDecls = parseFiles([bad]);
    expect(badDecls).toEqual([]);
  });
});
