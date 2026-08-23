// ADF-COVERS(verification): REQ-012-051
//
// agentdev-traceability 配布スキル check の検証対応要否の分類状態導出の検証
// （Issue #2419、TS-004 (6)(7)）。分類状態が対応宣言コーパスと検証対応要否
// カタログの登録状態から導出されること（未分類 = 検証対応宣言なし かつ
// カタログ未登録）、分類状態のみを保持する台帳・REQ frontmatter 項目・派生索引を
// 新設しないこと（純粋関数・決定的導出）、全行分類済みかつ必須行に恒久検証対応が
// 存在する場合に本要件起因の検査 fail が発生しないこと（(6)）、任意行に恒久テストが
// 存在しないことだけを理由に検査 fail とならないこと（(7)）を検証する。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";
import {
  classifyVerificationScope,
  declaredVerificationReqIds,
} from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/classification.ts";
import {
  DEFAULT_VERIFICATION_SCOPE_CATALOG,
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
const RUN_ID = `trace-classification-${crypto.randomUUID().slice(0, 8)}`;
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

const KNOWN: readonly string[] = [
  "REQ-900-001",
  "REQ-900-002",
  "REQ-900-003",
  "REQ-900-004",
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

describe("分類状態導出の基本（REQ-012-051 導出条件）", () => {
  it("検証対応宣言ありの行は verification-present（カタログ登録の有無は問わない）", () => {
    const entries = classifyVerificationScope(
      ["REQ-900-001", "REQ-900-002"],
      new Set(["REQ-900-001", "REQ-900-002"]),
      new Set(["REQ-900-002"]),
    );
    // 002 は宣言あり・カタログ登録済みの両方（両ソース合意）。宣言ありを優先し分類済み
    expect(entries).toEqual([
      { reqId: "REQ-900-001", classification: "verification-present" },
      { reqId: "REQ-900-002", classification: "verification-present" },
    ]);
  });

  it("宣言なし・カタログ登録済みの行は catalog-registered（検証対応任意行）", () => {
    const entries = classifyVerificationScope(
      ["REQ-900-002"],
      new Set<string>(),
      new Set(["REQ-900-002"]),
    );
    expect(entries).toEqual([{ reqId: "REQ-900-002", classification: "catalog-registered" }]);
  });

  it("宣言なし・カタログ未登録の行は unclassified（未分類）", () => {
    const entries = classifyVerificationScope(
      ["REQ-900-004"],
      new Set<string>(),
      new Set<string>(),
    );
    expect(entries).toEqual([{ reqId: "REQ-900-004", classification: "unclassified" }]);
  });

  it("コーパス走査結果から検証対応宣言を持つ要件行ID集合を導出できる", () => {
    writeFixture("good/verif.ts", [tsDecl("verification", "REQ-900-001, REQ-900-003")]);
    writeFixture("good/impl.ts", [tsDecl("implementation", "REQ-900-001")]);
    const ids = declaredVerificationReqIds(scanCorpus(ROOT).declarations);
    expect([...ids].sort()).toEqual(["REQ-900-001", "REQ-900-003"]);
  });

  it("導出は純粋関数であり、同一入力から同一結果を返す（台帳・中間状態なし）", () => {
    const first = classifyVerificationScope(KNOWN, new Set(["REQ-900-001"]), new Set(["REQ-900-002"]));
    const second = classifyVerificationScope(KNOWN, new Set(["REQ-900-001"]), new Set(["REQ-900-002"]));
    expect(first).toEqual(second);
    expect(first.map((e) => e.classification)).toEqual([
      "verification-present",
      "catalog-registered",
      "unclassified",
      "unclassified",
    ]);
  });
});

describe("check レポートへの統合", () => {
  beforeAll(() => {
    writeCatalog(["- REQ-900-002"]);
    // 001: 実装+検証 / 002: 実装のみ（カタログ登録行・宣言なし）/
    // 003: 実装+検証 / 004: 実装のみ（未登録行・宣言なし = 未分類）
    writeFixture("good/impl.ts", [tsDecl("implementation", KNOWN.join(", "))]);
    writeFixture("good/verif.ts", [tsDecl("verification", "REQ-900-001, REQ-900-003")]);
  });

  it("全現行要件行の分類状態を knownReqIds 順で報告する", () => {
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    expect(report.verificationClassification).toEqual([
      { reqId: "REQ-900-001", classification: "verification-present" },
      { reqId: "REQ-900-002", classification: "catalog-registered" },
      { reqId: "REQ-900-003", classification: "verification-present" },
      { reqId: "REQ-900-004", classification: "unclassified" },
    ]);
  });

  it("missing-verification の findings は未分類行と同一の行集合（単一導出から計上）", () => {
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    const unclassified = report.verificationClassification
      .filter((e) => e.classification === "unclassified")
      .map((e) => e.reqId);
    const missingVerification = report.checks["missing-verification"].findings.map((f) => f.reqId);
    expect(unclassified).toEqual(["REQ-900-004"]);
    expect(missingVerification).toEqual(unclassified);
  });

  it("完全性検査の対象限定（--req 相当）の影響を受けず全行を報告する", () => {
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, {
      verificationScope: resolved,
      completenessReqIds: ["REQ-900-001"],
    });
    expect(report.verificationClassification.map((e) => e.reqId)).toEqual([...KNOWN]);
    expect(report.checks["missing-verification"].findings).toEqual([]);
  });

  it("繰り返し実行で同一の導出結果を返す（呼び出し間で状態を保持しない）", () => {
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const first = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    const second = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    expect(second.verificationClassification).toEqual(first.verificationClassification);
  });
});

describe("段階ゲート状態遷移（TS-004 (6)(7)、REQ-012-051 導出面）", () => {
  it("(6) 全行分類済みかつ必須行に恒久検証対応が存在する場合、本要件起因の検査 fail が発生しない", () => {
    writeCatalog(["- REQ-900-002"]);
    // 001..004 すべてに実装対応。検証対応は必須行（001, 003, 004）に存在。
    // 002 はカタログ登録により分類済み（任意行・宣言なし）。
    writeFixture("good/impl.ts", [tsDecl("implementation", KNOWN.join(", "))]);
    writeFixture("good/verif.ts", [tsDecl("verification", "REQ-900-001, REQ-900-003, REQ-900-004")]);
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    expect(
      report.verificationClassification.some((e) => e.classification === "unclassified"),
    ).toBe(false);
    expect(report.checks["missing-verification"].status).toBe("pass");
    expect(report.checks["missing-implementation"].status).toBe("pass");
    expect(report.summary.fail).toBe(0);
  });

  it("(7) 任意行に恒久テストが存在しないことだけを理由として検査 fail とならない", () => {
    writeCatalog(["- REQ-900-002"]);
    writeFixture("good/impl.ts", [tsDecl("implementation", KNOWN.join(", "))]);
    // 検証対応は必須行（001, 003, 004）のみ。任意行 002 は宣言なし。
    writeFixture("good/verif.ts", [tsDecl("verification", "REQ-900-001, REQ-900-003, REQ-900-004")]);
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    const entryOf002 = report.verificationClassification.find((e) => e.reqId === "REQ-900-002");
    expect(entryOf002?.classification).toBe("catalog-registered");
    expect(
      report.checks["missing-verification"].findings.some((f) => f.reqId === "REQ-900-002"),
    ).toBe(false);
    expect(report.checks["missing-verification"].status).toBe("pass");
  });

  it("未分類行の残存は missing-verification の fail として現れる（ゲート阻止条件の入力）", () => {
    writeCatalog(["- REQ-900-002"]);
    writeFixture("good/impl.ts", [tsDecl("implementation", KNOWN.join(", "))]);
    // 004 の検証対応を欠落させる（宣言なし・未登録 = 未分類）
    writeFixture("good/verif.ts", [tsDecl("verification", "REQ-900-001, REQ-900-003")]);
    const resolved = resolveVerificationScopeFromRoot(ROOT, KNOWN);
    const report = runChecks(scanCorpus(ROOT), KNOWN, { verificationScope: resolved });
    expect(report.checks["missing-verification"].findings).toEqual([{ reqId: "REQ-900-004" }]);
    expect(report.checks["missing-verification"].status).toBe("fail");
  });
});

describe("check CLI の分類状態出力", () => {
  it("CLI の JSON レポートに verificationClassification が含まれる", () => {
    writeCatalog(["- REQ-900-002"]);
    writeFixture("good/impl.ts", [tsDecl("implementation", KNOWN.join(", "))]);
    writeFixture("good/verif.ts", [tsDecl("verification", "REQ-900-001, REQ-900-003, REQ-900-004")]);
    const proc = Bun.spawnSync(["bun", "run", CHECK_CLI, "--root", ROOT], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const report = JSON.parse(proc.stdout!.toString("utf-8")) as {
      verificationClassification: { reqId: string; classification: string }[];
      summary: { pass: number; fail: number };
    };
    expect(report.verificationClassification).toEqual([
      { reqId: "REQ-900-001", classification: "verification-present" },
      { reqId: "REQ-900-002", classification: "catalog-registered" },
      { reqId: "REQ-900-003", classification: "verification-present" },
      { reqId: "REQ-900-004", classification: "verification-present" },
    ]);
    expect(report.summary.fail).toBe(0);
    expect(proc.exitCode).toBe(0);
  });
});
