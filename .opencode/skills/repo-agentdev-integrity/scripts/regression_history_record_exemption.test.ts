import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const CHECKER_PATH = join(SCRIPT_DIR, "check_integrity.ts");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `history-record-exemption-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

interface CheckerResult {
  readonly category: string;
  readonly check: string;
  readonly level: string;
  readonly message: string;
  readonly file?: string;
}

interface CheckerReport {
  readonly results: readonly CheckerResult[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseCheckerReport(stdout: string): CheckerReport {
  const parsed: unknown = JSON.parse(stdout);
  if (!isRecord(parsed) || !Array.isArray(parsed.results)) {
    throw new Error("Checker JSON report must include a results array.");
  }
  const results: CheckerResult[] = [];
  for (const value of parsed.results) {
    if (
      !isRecord(value) ||
      typeof value.category !== "string" ||
      typeof value.check !== "string" ||
      typeof value.level !== "string" ||
      typeof value.message !== "string"
    ) {
      throw new Error(
        "Checker result must contain category, check, level, and message strings.",
      );
    }
    results.push({
      category: value.category,
      check: value.check,
      level: value.level,
      message: value.message,
      file: typeof value.file === "string" ? value.file : undefined,
    });
  }
  return { results };
}

function runChecker(root: string): CheckerReport {
  const processResult = Bun.spawnSync(
    ["bun", "run", CHECKER_PATH, "--root", root, "--json"],
    { stdout: "pipe", stderr: "pipe" },
  );
  const stdout = processResult.stdout.toString("utf-8");
  if (stdout.length === 0) {
    throw new Error(
      `Checker emitted no JSON (exit ${processResult.exitCode ?? -1}): ${processResult.stderr.toString("utf-8")}`,
    );
  }
  return parseCheckerReport(stdout);
}

function writeFixtureFile(filePath: string, content: string): void {
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, content, "utf-8");
}

function buildFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  const retiredReqDir = join(reqDir, "retired");

  writeFixtureFile(
    join(reqDir, "REQ-001.md"),
    [
      "---",
      "id: REQ-001",
      "title: Active fixture requirement",
      "created: 2026-07-26",
      "updated: 2026-07-26",
      "---",
      "",
      "# REQ-001",
      "",
      "Active requirement body.",
      "",
    ].join("\n"),
  );
  writeFixtureFile(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-001 | Active fixture requirement |",
      "",
    ].join("\n"),
  );
  writeFixtureFile(
    join(retiredReqDir, "REQ-9999.md"),
    [
      "---",
      "id: REQ-9999",
      "title: Retired fixture requirement",
      "created: 2026-07-26",
      "updated: 2026-07-26",
      "---",
      "",
      "# REQ-9999",
      "",
      "Retired requirement body.",
      "",
    ].join("\n"),
  );
  writeFixtureFile(
    join(root, "docs", "adr", "README.md"),
    "# ADR\n",
  );
  writeFixtureFile(join(root, "docs", "designs", "README.md"), "# Design\n");

  // 監査記録（docs/reports 配下の Report。Issue #2349 Report分離により Design 走査対象外）。
  // 表内の REQ-9999 参照は retired 参照系 warning の対象にならない。
  writeFixtureFile(
    join(root, "docs", "reports", "integrity", "audits", "retired-ref-audit-fixture.md"),
    [
      "---",
      "id: AUDIT-RETIRED-REF-FIXTURE",
      "title: retired 参照監査記録フィクスチャ",
      "status: accepted",
      "created: 2026-08-18",
      "audit_for: REQ-001",
      "---",
      "",
      "# retired 参照監査記録フィクスチャ",
      "",
      "| REQ | 判定 |",
      "|-----|------|",
      "| REQ-9999 | 履歴記録として記載 |",
      "",
    ].join("\n"),
  );

  // baseline snapshot（docs/reports 配下の Report。Issue #2349 Report分離により Design 走査対象外）。
  writeFixtureFile(
    join(root, "docs", "reports", "integrity", "snapshot-fixture.md"),
    [
      "---",
      "id: BASELINE-RETIRED-REF-FIXTURE",
      "title: baseline snapshot フィクスチャ",
      "status: accepted",
      "created: 2026-08-18",
      "baseline_for: REQ-001",
      "---",
      "",
      "# baseline snapshot フィクスチャ",
      "",
      "| REQ | 状態 |",
      "|-----|------|",
      "| REQ-9999 | 計測時点の残存参照 |",
      "",
    ].join("\n"),
  );

  // 対照群: 履歴文脈のない通常 SPEC ファイル。免除を適用しない範囲の固定。
  writeFixtureFile(
    join(root, "docs", "designs", "integrity", "control-design-fixture.md"),
    [
      "# 対照 SPEC フィクスチャ",
      "",
      "| 参照 | 用途 |",
      "|------|------|",
      "| REQ-9999 | 現行要件として参照 |",
      "",
    ].join("\n"),
  );
}

beforeAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
  buildFixture(TEMP_ROOT);
});

afterAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe("history record exemption for retired-reference detections", () => {
  const RETIRED_REF_CHECKS = new Set([
    "retired-req-as-current",
    "retired-req-primary-ref",
  ]);

  it("監査記録（audits/ 配下）の retired 参照は警告されない", () => {
    const report = runChecker(TEMP_ROOT);
    const auditFindings = report.results.filter(
      (r) =>
        RETIRED_REF_CHECKS.has(r.check) &&
        (r.file ?? "").includes("audits") &&
        (r.file ?? "").includes("retired-ref-audit-fixture"),
    );
    expect(auditFindings).toEqual([]);
  });

  it("baseline_for 信号キーを持つファイルの retired 参照は警告されない", () => {
    const report = runChecker(TEMP_ROOT);
    const baselineFindings = report.results.filter(
      (r) =>
        RETIRED_REF_CHECKS.has(r.check) &&
        (r.file ?? "").includes("snapshot-fixture"),
    );
    expect(baselineFindings).toEqual([]);
  });

  it("履歴文脈のない通常 Design ファイルの retired 参照は警告され続ける", () => {
    const report = runChecker(TEMP_ROOT);
    const controlFindings = report.results.filter(
      (r) =>
        RETIRED_REF_CHECKS.has(r.check) &&
        (r.file ?? "").includes("control-design-fixture"),
    );
    expect(controlFindings.length).toBeGreaterThan(0);
  });
});
