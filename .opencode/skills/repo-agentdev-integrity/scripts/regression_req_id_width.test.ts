import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const CHECKER_PATH = join(SCRIPT_DIR, "check_integrity.ts");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `req-id-width-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

interface CheckerResult {
  readonly check: string;
  readonly level: string;
  readonly message: string;
  readonly evidence?: string;
}

interface CheckerReport {
  readonly results: readonly CheckerResult[];
}

function writeFixtureFile(filePath: string, content: string): void {
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, content, "utf-8");
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
      typeof value.check !== "string" ||
      typeof value.level !== "string" ||
      typeof value.message !== "string"
    ) {
      throw new Error("Checker result must contain check, level, and message strings.");
    }
    if (value.evidence !== undefined && typeof value.evidence !== "string") {
      throw new Error("Checker result evidence must be a string when present.");
    }
    if (value.evidence === undefined) {
      results.push({
        check: value.check,
        level: value.level,
        message: value.message,
      });
    } else {
      results.push({
        check: value.check,
        level: value.level,
        message: value.message,
        evidence: value.evidence,
      });
    }
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

function makeReqFile(id: string, body: string): string {
  return [
    "---",
    `id: ${id}`,
    `title: ${id} fixture`,
    "created: 2026-07-26",
    "updated: 2026-07-26",
    "tags:",
    "  - test",
    "---",
    "",
    `# ${id}`,
    "",
    body,
    "",
  ].join("\n");
}

function makeAdrFile(id: string, body: string): string {
  return [
    "---",
    `id: ${id}`,
    `title: ${id} fixture`,
    "status: accepted",
    "created: 2026-07-26",
    "---",
    "",
    `# ${id}`,
    "",
    body,
    "",
  ].join("\n");
}

function buildNamespaceFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  const adrDir = join(root, "docs", "adr");

  writeFixtureFile(
    join(reqDir, "REQ-001.md"),
    makeReqFile(
      "REQ-001",
      [
        "Current ADR-001 is valid.",
        "Historical lineage v2:ADR-0105 has no worktree file.",
        "Plain broken ADR-999 must remain detectable.",
      ].join("\n"),
    ),
  );
  writeFixtureFile(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-001 | Current fixture |",
      "",
    ].join("\n"),
  );

  writeFixtureFile(
    join(adrDir, "ADR-001.md"),
    makeAdrFile(
      "ADR-001",
      [
        "Current REQ-001 is valid.",
        "Historical lineage v2:REQ-0102 has no worktree file.",
        "Plain broken REQ-999 must remain detectable.",
      ].join("\n"),
    ),
  );
  for (const id of ["ADR-002", "ADR-003", "ADR-004", "ADR-005"]) {
    writeFixtureFile(join(adrDir, `${id}.md`), makeAdrFile(id, "Current ADR."));
  }
  writeFixtureFile(
    join(adrDir, "README.md"),
    [
      "# ADR",
      "",
      "## 現行 ADR",
      "",
      "| ADR番号 | タイトル | ステータス | 作成日 |",
      "|---------|---------|-----------|--------|",
      "| ADR-001 | Current 1 | accepted | 2026-07-26 |",
      "| ADR-002 | Current 2 | accepted | 2026-07-26 |",
      "| ADR-003 | Current 3 | accepted | 2026-07-26 |",
      "| ADR-004 | Current 4 | accepted | 2026-07-26 |",
      "| ADR-005 | Current 5 | accepted | 2026-07-26 |",
      "",
      "## 過去版の履歴基盤",
      "",
      "| v2:ADR-0105 | Historical source/projection | accepted | 2026-06-08 |",
      "",
    ].join("\n"),
  );

  writeFixtureFile(
    join(root, "docs", "DOC-MAP.md"),
    [
      "# DOC-MAP",
      "",
      "Current REQ-001 is listed.",
      "Historical lineage v2:REQ-0102 is tag scoped.",
      "Plain broken REQ-999 must remain detectable.",
      "",
    ].join("\n"),
  );
  writeFixtureFile(join(root, "docs", "specs", "README.md"), "# SPEC\n");
}

function containsFinding(
  results: readonly CheckerResult[],
  check: string,
  evidence: string,
): boolean {
  return results.some(
    (result) => result.check === check && result.evidence === evidence,
  );
}

function containsFindingMessage(
  results: readonly CheckerResult[],
  check: string,
  text: string,
): boolean {
  return results.some(
    (result) => result.check === check && result.message.includes(text),
  );
}

beforeAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
  buildNamespaceFixture(TEMP_ROOT);
});

afterAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe("current-worktree integrity checks distinguish current IDs from v2 lineage", () => {
  it("still detects plain broken current REQ and ADR references", () => {
    const report = runChecker(TEMP_ROOT);

    expect(containsFinding(report.results, "broken-req-ref", "REQ-999")).toBe(
      true,
    );
    expect(containsFinding(report.results, "broken-adr-ref", "ADR-999")).toBe(
      true,
    );
    expect(
      containsFindingMessage(report.results, "adr-req-crossref", "REQ-999"),
    ).toBe(true);
    expect(
      containsFindingMessage(report.results, "adr-req-crossref", "ADR-999"),
    ).toBe(true);
  });

  it("excludes v2:REQ-0102 from current-file reference checks", () => {
    const report = runChecker(TEMP_ROOT);
    expect(containsFinding(report.results, "broken-req-ref", "REQ-0102")).toBe(
      false,
    );
    expect(
      containsFindingMessage(report.results, "adr-req-crossref", "REQ-0102"),
    ).toBe(false);
    expect(
      containsFinding(report.results, "docmap-req-sync", "REQ-0102"),
    ).toBe(false);
  });

  it("excludes v2:ADR-0105 from current-file reference checks", () => {
    const report = runChecker(TEMP_ROOT);
    expect(containsFinding(report.results, "broken-adr-ref", "ADR-0105")).toBe(
      false,
    );
    expect(
      containsFindingMessage(report.results, "adr-req-crossref", "ADR-0105"),
    ).toBe(false);
  });

  it("recognizes ADR-001 through ADR-005 while excluding v2 inventory rows", () => {
    const report = runChecker(TEMP_ROOT);
    const adrInventoryFindings = report.results.filter(
      (result) => result.check === "adr-readme-index" && result.level === "ng",
    );
    expect(adrInventoryFindings).toEqual([]);
  });
});
