// ADF-COVERS(verification): REQ-012-030, REQ-012-047
//
// agentdev-traceability 配布スキル check の検証対応要否カタログ対応の検証
// （Issue #2366、TS-002）。カタログ解析（単一・範囲エントリ、説明文の無視、
// 節スコープ）、範囲展開（中間欠番）、missing-verification の検証対応必須行への
// 計上限定（REQ-012-030）、missing-implementation の全行維持、
// 存在しない要件行へのカタログ参照の検出（REQ-012-047 の追加検査）、
// カタログ不在時の現行挙動維持、区分の影響を受けない4検査を検証する。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";
import { currentRequirementLineIds } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/requirements.ts";
import {
  DEFAULT_VERIFICATION_SCOPE_CATALOG,
  parseVerificationScopeCatalog,
  resolveVerificationScope,
  resolveVerificationScopeFromRoot,
} from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/verification_scope.ts";
import { findRepoRoot } from "../cli_utils.ts";

const SCRIPT_DIR = import.meta.dir;
const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const CHECK_CLI = join(
  REPO_ROOT,
  "src",
  "opencode",
  "skills",
  "agentdev-traceability",
  "scripts",
  "src",
  "check.ts",
);

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-scope-${crypto.randomUUID().slice(0, 8)}`;
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

function writeCatalog(entryLines: readonly string[]): void {
  writeFixture(DEFAULT_VERIFICATION_SCOPE_CATALOG, [
    "---",
    "title: 検証対応要否カタログ（テストフィクスチャ）",
    "---",
    "",
    "# 検証対応要否カタログ",
    "",
    "## 形式",
    "",
    "- 1行1エントリとする",
    "- エントリは要件行IDまたは範囲表現で記述する（この節の箇条書きはエントリ対象外）",
    "",
    "## 任意行エントリ",
    "",
    ...entryLines,
  ]);
}

beforeAll(() => {
  mkdirSync(ROOT, { recursive: true });
  writeRequirements();
});
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("カタログの解析", () => {
  it("単一エントリと範囲エントリを抽出し、後置説明文を解釈しない", () => {
    writeCatalog([
      "- REQ-900-001",
      "- REQ-900-002..REQ-900-006: 説明文（後置）",
      "（注記行は箇条書きではないため対象外）",
    ]);
    const content = readFileSync(join(ROOT, DEFAULT_VERIFICATION_SCOPE_CATALOG), "utf-8");
    const parsed = parseVerificationScopeCatalog(content);
    expect(parsed.issues).toEqual([]);
    expect(parsed.entries.map((e) => e.startId)).toEqual(["REQ-900-001", "REQ-900-002"]);
    expect(parsed.entries[1]?.endId).toBe("REQ-900-006");
  });

  it("形式節の箇条書きと未対応の行をエントリ・issue として扱わない", () => {
    const parsed = parseVerificationScopeCatalog(
      ["# 検証対応要否カタログ", "", "## 形式", "", "- 1行1エントリとする", "", "## 任意行エントリ", "", "（初期は空とする）"].join(
        "\n",
      ),
    );
    expect(parsed.entries).toEqual([]);
    expect(parsed.issues).toEqual([]);
  });

  it("任意行エントリ節が存在しない場合はエントリ0件（全行必須）", () => {
    const parsed = parseVerificationScopeCatalog("# 別の文書\n\n- REQ-900-001\n");
    expect(parsed.entries).toEqual([]);
    expect(parsed.issues).toEqual([]);
  });
});

describe("範囲表現の展開", () => {
  it("範囲を既知要件行へ展開し、中間の欠番行は登録しない", () => {
    const parsed = parseVerificationScopeCatalog(
      "## 任意行エントリ\n\n- REQ-900-002..REQ-900-006\n",
    );
    const resolved = resolveVerificationScope(parsed.entries, KNOWN);
    expect(resolved.issues).toEqual([]);
    expect([...resolved.optionalReqIds]).toEqual([
      "REQ-900-002",
      "REQ-900-003",
      "REQ-900-004",
      // REQ-900-005 は欠番のため登録されない
      "REQ-900-006",
    ]);
  });

  it("同一REQファイル外の範囲と逆順の範囲を検出し、展開しない", () => {
    const parsed = parseVerificationScopeCatalog(
      ["## 任意行エントリ", "", "- REQ-900-001..REQ-901-003", "- REQ-900-006..REQ-900-002"].join("\n"),
    );
    expect(parsed.entries).toEqual([]);
    expect(parsed.issues.map((i) => i.reason)).toEqual([
      "cross-req-file-range",
      "reversed-range",
    ]);
  });
});

describe("存在しない要件行へのカタログ参照の検出", () => {
  it("未知参照・形式違反を invalid-catalog-refs で検出する", () => {
    writeCatalog([
      "- REQ-900-001..REQ-901-003",
      "- REQ-900-006..REQ-900-002",
      "- 説明のみの行",
      "- REQ-900-999",
      "- REQ-900-001..REQ-900-998",
    ]);
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    expect(resolved.optionalReqIds.size).toBe(0);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    const check = report.checks["invalid-catalog-refs"];
    expect(check.status).toBe("fail");
    // issue は解析段（ファイル行順）→ 突合段（エントリ順）の順で報告される
    expect(check.findings.map((f) => [f.reason, f.reqId])).toEqual([
      ["cross-req-file-range", undefined],
      ["reversed-range", undefined],
      ["malformed-entry", undefined],
      ["unknown-req-ref", "REQ-900-999"],
      ["unknown-req-ref", "REQ-900-998"],
    ]);
    expect(check.findings.every((f) => f.file === DEFAULT_VERIFICATION_SCOPE_CATALOG)).toBe(true);
  });

  it("カタログが存在しない場合は issue 0件（検査 pass）", () => {
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN, "docs/not/found.md");
    expect(resolved.optionalReqIds.size).toBe(0);
    expect(resolved.issues).toEqual([]);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    expect(report.checks["invalid-catalog-refs"].status).toBe("pass");
  });
});

describe("missing-verification の計上限定（REQ-012-030）", () => {
  beforeAll(() => {
    writeCatalog(["- REQ-900-002", "- REQ-900-003..REQ-900-004"]);
    // 001: 実装+検証 / 002: 実装のみ（登録行）/ 003: 検証のみ（登録行）/
    // 006: 実装+検証 / 007: 実装のみ（未登録行）
    writeFixture("good/a.ts", [tsDecl("implementation", "REQ-900-001, REQ-900-002, REQ-900-007")]);
    writeFixture("good/b.ts", [tsDecl("verification", "REQ-900-001, REQ-900-003, REQ-900-006")]);
  });

  it("カタログ登録行の検証対応0件は計上せず、未登録行のみ計上する", () => {
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    expect(report.checks["missing-verification"].findings).toEqual([{ reqId: "REQ-900-007" }]);
  });

  it("missing-implementation はカタログ登録行を含む全行で計上する（REQ-012-029 維持）", () => {
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    expect(report.checks["missing-implementation"].findings).toEqual([
      { reqId: "REQ-900-003" },
      { reqId: "REQ-900-004" },
      { reqId: "REQ-900-006" },
    ]);
  });

  it("完全性検査の対象限定（--req 相当）でも登録行は計上されない", () => {
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, {
      verificationScope: resolved,
      completenessReqIds: ["REQ-900-002", "REQ-900-004"],
    });
    expect(report.checks["missing-verification"].status).toBe("pass");
    expect(report.checks["missing-implementation"].findings).toEqual([{ reqId: "REQ-900-004" }]);
  });
});

describe("区分の影響を受けない検査（REQ-012-047）", () => {
  it("malformed-declarations / unknown-roles / unknown-req-refs / evidence-unavailable はカタログ存在下でも検査できる", () => {
    writeCatalog(["- REQ-900-002"]);
    writeFixture("bad/syntax.md", [`<!-- ${MARKER}(design) REQ-900-001 -->`]);
    writeFixture("bad/role.md", [`<!-- ${MARKER}(review): REQ-900-001 -->`]);
    writeFixture("bad/ref.ts", [tsDecl("implementation", "REQ-900-997")]);
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, {
      verificationScope: resolved,
      evidenceArtifacts: [{ artifact: "not/found.md", reason: "file-not-found" }],
    });
    expect(report.checks["malformed-declarations"].status).toBe("fail");
    expect(report.checks["unknown-roles"].status).toBe("fail");
    expect(report.checks["unknown-req-refs"].findings.some((f) => f.reqId === "REQ-900-997")).toBe(
      true,
    );
    expect(report.checks["evidence-unavailable"].findings[0]?.artifact).toBe("not/found.md");
    expect(report.checks["invalid-catalog-refs"].status).toBe("pass");
  });
});

describe("カタログ不在時の現行挙動維持", () => {
  it("カタログ不在では全要件行が検証対応必須として計上される", () => {
    writeFixture("good/c.ts", [tsDecl("implementation", "REQ-900-002, REQ-900-007")]);
    // 実装対応は a.ts（001,002,007）と c.ts（002,007）に存在。検証対応は b.ts（001,003,006）のみ。
    // 002 は本来カタログ登録行だが、カタログ不在（代替パス指定）では必須として計上される。
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN, "docs/not/found.md");
    expect(resolved.optionalReqIds.size).toBe(0);
    const report = runChecks(scanCorpus(ROOT), KNOWN, {
      verificationScope: resolved,
      completenessReqIds: ["REQ-900-002", "REQ-900-007"],
    });
    expect(report.checks["missing-verification"].findings).toEqual([
      { reqId: "REQ-900-002" },
      { reqId: "REQ-900-007" },
    ]);
    expect(report.checks["missing-implementation"].findings).toEqual([]);
  });
});

describe("check CLI のカタログ自動読込", () => {
  it("CLI が既定パスのカタログを解釈し、missing-verification を必須行のみへ計上する", () => {
    writeCatalog(["- REQ-900-002", "- REQ-900-003..REQ-900-004"]);
    writeFixture("good/e.ts", [tsDecl("implementation", "REQ-900-002, REQ-900-007")]);
    const proc = Bun.spawnSync(["bun", "run", CHECK_CLI, "--root", ROOT], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const report = JSON.parse(proc.stdout!.toString("utf-8")) as {
      checks: Record<string, { status: string; findings: { reqId?: string }[] }>;
      summary: { pass: number; fail: number };
    };
    expect(report.checks["invalid-catalog-refs"]!.status).toBe("pass");
    expect(report.checks["missing-verification"]!.findings).toEqual([{ reqId: "REQ-900-007" }]);
    expect(proc.exitCode).toBe(2);
  });
});
