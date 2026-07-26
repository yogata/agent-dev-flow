import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const CHECKER_PATH = join(SCRIPT_DIR, "check_integrity.ts");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `mapping-table-retired-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

interface CheckerResult {
  readonly category: string;
  readonly check: string;
  readonly level: string;
  readonly message: string;
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
  const adrDir = join(root, "docs", "adr");

  writeFixtureFile(
    join(reqDir, "REQ-001.md"),
    [
      "---",
      "id: REQ-001",
      "title: Active fixture requirement",
      "created: 2026-07-26",
      "updated: 2026-07-26",
      "tags:",
      "  - test",
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
  // mapping-table.md is the retired v3 contract. Its content mixes signals
  // that previously triggered MappingTable NGs (dangling old REQ ref,
  // unknown status enum) and the LifecycleBoundary mapping-table-nonexistent
  // NG. After contract removal these must produce no MappingTable-category
  // or mapping-table-* check findings.
  writeFixtureFile(
    join(reqDir, "mapping-table.md"),
    [
      "# 対応表",
      "",
      "## 対応表",
      "",
      "| old | status | successor |",
      "|-----|--------|-----------|",
      "| REQ-8888 | unknown-status | REQ-001 |",
      "",
    ].join("\n"),
  );

  // Retired-path coverage. Base commit d07fb284 checkLifecycleBoundary read
  // docs/requirements/retired/mapping-table.md in (d)/(e): REQ-7777 exists in
  // neither active nor retired, so restoring (d) re-emits mapping-table-nonexistent;
  // REQ-9999 is retired but absent here, so restoring (e) re-emits
  // retired-missing-from-mapping. After contract removal both stay silent.
  const retiredReqDir = join(reqDir, "retired");
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
    join(retiredReqDir, "mapping-table.md"),
    [
      "# 対応表（retired）",
      "",
      "## 対応表",
      "",
      "| old | status | successor |",
      "|-----|--------|-----------|",
      "| REQ-7777 | retired-no-successor | REQ-001 |",
      "",
    ].join("\n"),
  );

  writeFixtureFile(
    join(adrDir, "ADR-001.md"),
    [
      "---",
      "id: ADR-001",
      "title: Active fixture ADR",
      "status: accepted",
      "created: 2026-07-26",
      "---",
      "",
      "# ADR-001",
      "",
      "Active ADR body referencing REQ-001.",
      "",
    ].join("\n"),
  );
  writeFixtureFile(
    join(adrDir, "README.md"),
    [
      "# ADR",
      "",
      "## 現行 ADR",
      "",
      "| ADR番号 | タイトル | ステータス | 作成日 |",
      "|---------|---------|-----------|--------|",
      "| ADR-001 | Active fixture ADR | accepted | 2026-07-26 |",
      "",
    ].join("\n"),
  );

  writeFixtureFile(
    join(root, "docs", "DOC-MAP.md"),
    ["# DOC-MAP", "", "Lists REQ-001 and ADR-001.", ""].join("\n"),
  );
  writeFixtureFile(join(root, "docs", "specs", "README.md"), "# SPEC\n");
}

beforeAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
  buildFixture(TEMP_ROOT);
});

afterAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe("retired mapping-table contract is no longer enforced", () => {
  const RETIRED_CHECKS = new Set([
    "mapping-table-nonexistent",
    "mapping-table-completeness",
    "mapping-table-migration-target",
    "mapping-table-status-enum",
    "mapping-table-history",
    "retired-missing-from-mapping",
  ]);

  it("emits no MappingTable category findings", () => {
    const report = runChecker(TEMP_ROOT);
    const mappingTableCategory = report.results.filter(
      (r) => r.category === "MappingTable",
    );
    expect(mappingTableCategory).toEqual([]);
  });

  it("emits no retired mapping-table check findings even with dangling refs and bad status", () => {
    const report = runChecker(TEMP_ROOT);
    const retired = report.results.filter((r) => RETIRED_CHECKS.has(r.check));
    expect(retired).toEqual([]);
  });

  it("does not regress mapping-table references in check or message text", () => {
    const report = runChecker(TEMP_ROOT);
    const stale = report.results.filter(
      (r) =>
        r.check.includes("mapping-table") ||
        r.message.toLowerCase().includes("mapping-table"),
    );
    expect(stale).toEqual([]);
  });
});
